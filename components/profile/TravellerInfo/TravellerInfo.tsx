"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { useAuth, type CurrentUser } from "@/components/providers/AuthProvider";
import {
  getTravellerById,
  type GetTravellerByIdResponse,
} from "@/lib/api/travellers";
import styles from "./TravellerInfo.module.css";

interface TravellerInfoProps {
  userId: string;
}

interface CropOffset {
  x: number;
  y: number;
}

interface PointerDrag {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

const defaultAvatar =
  "https://ac.goit.global/fullstack/react/default-avatar.jpg";
const MAX_SOURCE_AVATAR_SIZE = 10 * 1024 * 1024;
const MAX_UPLOADED_AVATAR_SIZE = 1024 * 1024;
const CROP_SIZE = 256;
const OUTPUT_SIZE = 512;

type UpdatedProfile = Pick<CurrentUser, "_id" | "name" | "email" | "avatarUrl">;

async function updateProfile(
  formData: FormData,
  userId: string,
): Promise<UpdatedProfile> {
  const response = await fetchWithAuth("/api/users/me", {
    method: "PATCH",
    body: formData,
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      result && typeof result === "object" && "message" in result
        ? result.message
        : null;
    throw new Error(
      typeof message === "string" ? message : "Не вдалося оновити профіль.",
    );
  }

  if (
    !result || typeof result !== "object" ||
    !("_id" in result) || result._id !== userId ||
    !("name" in result) || typeof result.name !== "string" ||
    !("email" in result) || typeof result.email !== "string" ||
    !("avatarUrl" in result) ||
    (result.avatarUrl !== null && typeof result.avatarUrl !== "string")
  ) {
    throw new Error("Сервер повернув некоректні дані профілю.");
  }

  return {
    _id: userId,
    name: result.name,
    email: result.email,
    avatarUrl: result.avatarUrl,
  };
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m4 16.5-.8 4.3 4.3-.8L19.8 7.7a2.1 2.1 0 0 0-3-3L4 16.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m14.8 6.7 3 3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TravellerInfo({ userId }: TravellerInfoProps) {
  const { user: authenticatedUser, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropFrameRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const pointerDragRef = useRef<PointerDrag | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [feedback, setFeedback] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  const isOwner = authenticatedUser?._id === userId;

  const { data, isPending, isError } = useQuery({
    queryKey: ["traveller", userId],
    queryFn: () => getTravellerById(userId),
    enabled: Boolean(userId),
  });

  const profileMutation = useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData, userId),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.setQueryData<GetTravellerByIdResponse>(
        ["traveller", userId],
        (current) =>
          current
            ? {
                ...current,
                user: {
                  ...current.user,
                  name: updatedUser.name,
                  avatarUrl: updatedUser.avatarUrl ?? defaultAvatar,
                },
              }
            : current,
      );
      void queryClient.invalidateQueries({ queryKey: ["travellers"] });
      setFeedback({ message: "Профіль оновлено.", isError: false });
    },
  });

  const formik = useFormik({
    initialValues: { name: data?.user.name ?? "" },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .min(2, "Ім’я має містити щонайменше 2 символи.")
        .max(32, "Ім’я має містити не більше 32 символів.")
        .required("Введіть ім’я."),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const formData = new FormData();
      formData.append("name", values.name.trim());
      setFeedback(null);

      try {
        await profileMutation.mutateAsync(formData);
        setIsEditingName(false);
      } catch (error) {
        helpers.setStatus(
          error instanceof Error ? error.message : "Не вдалося оновити ім’я.",
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!selectedAvatar) {
      setCropImageUrl(null);
      setImageSize({ width: 0, height: 0 });
      return;
    }

    const imageUrl = URL.createObjectURL(selectedAvatar);
    setCropImageUrl(imageUrl);
    setImageSize({ width: 0, height: 0 });
    return () => URL.revokeObjectURL(imageUrl);
  }, [selectedAvatar]);

  useEffect(() => {
    if (!isAvatarDialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !profileMutation.isPending) {
        closeAvatarDialog();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // The dialog should keep its Escape handler while open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvatarDialogOpen, profileMutation.isPending]);

  if (isPending) {
    return <p>Завантаження профілю мандрівника...</p>;
  }

  if (isError || !data?.user) {
    return <p role="alert">Не вдалося завантажити профіль мандрівника.</p>;
  }

  const { user } = data;
  const articlesCount = data.pagination.totalItems;
  const hasCustomAvatar = Boolean(
    user.avatarUrl && user.avatarUrl !== defaultAvatar,
  );

  function getImageMetrics(nextZoom = zoom) {
    const width = imageSize.width;
    const height = imageSize.height;
    if (!width || !height) return null;

    const scale = Math.max(CROP_SIZE / width, CROP_SIZE / height) * nextZoom;
    return {
      scale,
      width: width * scale,
      height: height * scale,
      maxX: Math.max(0, (width * scale - CROP_SIZE) / 2),
      maxY: Math.max(0, (height * scale - CROP_SIZE) / 2),
    };
  }

  const imageMetrics = getImageMetrics();

  const closeAvatarDialog = () => {
    if (profileMutation.isPending) return;
    setIsAvatarDialogOpen(false);
    setSelectedAvatar(null);
    setZoom(1);
    setCropOffset({ x: 0, y: 0 });
    pointerDragRef.current = null;
  };

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
      setFeedback({
        message: "Оберіть зображення у форматі JPG, PNG або WebP.",
        isError: true,
      });
      return;
    }

    if (file.size > MAX_SOURCE_AVATAR_SIZE) {
      setFeedback({
        message: "Розмір початкового фото не має перевищувати 10 МБ.",
        isError: true,
      });
      return;
    }

    setFeedback(null);
    setZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setSelectedAvatar(file);
  };

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageMetrics) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: cropOffset.x,
      offsetY: cropOffset.y,
    };
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = pointerDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !imageMetrics) return;

    setCropOffset({
      x: Math.max(
        -imageMetrics.maxX,
        Math.min(imageMetrics.maxX, drag.offsetX + event.clientX - drag.startX),
      ),
      y: Math.max(
        -imageMetrics.maxY,
        Math.min(imageMetrics.maxY, drag.offsetY + event.clientY - drag.startY),
      ),
    });
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = Number(event.currentTarget.value);
    const metrics = getImageMetrics(nextZoom);
    setZoom(nextZoom);
    if (!metrics) return;
    setCropOffset((current) => ({
      x: Math.max(-metrics.maxX, Math.min(metrics.maxX, current.x)),
      y: Math.max(-metrics.maxY, Math.min(metrics.maxY, current.y)),
    }));
  };

  const makeCroppedAvatar = async (): Promise<File> => {
    const image = cropImageRef.current;
    const metrics = getImageMetrics();
    if (!image || !metrics || !imageSize.width || !imageSize.height) {
      throw new Error("Фото ще не готове до обрізання.");
    }

    const sourceWidth = CROP_SIZE / metrics.scale;
    const sourceX = Math.max(
      0,
      Math.min(
        imageSize.width - sourceWidth,
        (metrics.width / 2 - CROP_SIZE / 2 - cropOffset.x) / metrics.scale,
      ),
    );
    const sourceY = Math.max(
      0,
      Math.min(
        imageSize.height - sourceWidth,
        (metrics.height / 2 - CROP_SIZE / 2 - cropOffset.y) / metrics.scale,
      ),
    );

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Не вдалося обробити фото.");

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceWidth,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) throw new Error("Не вдалося підготувати фото для завантаження.");

    return new File([blob], "profile-avatar.jpg", { type: "image/jpeg" });
  };

  const handleSaveAvatar = async () => {
    try {
      const croppedAvatar = await makeCroppedAvatar();
      if (croppedAvatar.size > MAX_UPLOADED_AVATAR_SIZE) {
        throw new Error(
          "Обрізане фото завелике. Зменште масштаб і спробуйте ще раз.",
        );
      }

      const formData = new FormData();
      formData.append("avatar", croppedAvatar);
      setFeedback(null);
      await profileMutation.mutateAsync(formData);
      setIsAvatarDialogOpen(false);
      setSelectedAvatar(null);
      setZoom(1);
      setCropOffset({ x: 0, y: 0 });
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити аватар.",
        isError: true,
      });
    }
  };

  const handleResetAvatar = async () => {
    const formData = new FormData();
    formData.append("resetAvatar", "true");
    setFeedback(null);

    try {
      await profileMutation.mutateAsync(formData);
      setIsAvatarDialogOpen(false);
      setSelectedAvatar(null);
      setZoom(1);
      setCropOffset({ x: 0, y: 0 });
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося відновити аватар.",
        isError: true,
      });
    }
  };

  const startNameEdit = () => {
    formik.resetForm({ values: { name: user.name } });
    setFeedback(null);
    setIsEditingName(true);
  };

  const cancelNameEdit = () => {
    formik.resetForm({ values: { name: user.name } });
    formik.setStatus(undefined);
    setIsEditingName(false);
  };

  return (
    <section className={styles.travellerCard}>
      <div className={styles.avatarWrapper}>
        <Image
          src={user.avatarUrl || defaultAvatar}
          alt={user.name || "Мандрівник"}
          width={113}
          height={113}
          className={styles.avatar}
          unoptimized
        />
        {isOwner && (
          <button
            type="button"
            className={styles.avatarEditButton}
            aria-label="Налаштувати фото профілю"
            title="Налаштувати фото профілю"
            disabled={profileMutation.isPending}
            onClick={() => {
              setFeedback(null);
              setIsAvatarDialogOpen(true);
            }}
          >
            <span aria-hidden="true">+</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        className={styles.fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Оберіть зображення аватара"
        tabIndex={-1}
        onChange={handleAvatarFileChange}
      />

      <div className={styles.details}>
        {isEditingName && isOwner ? (
          <form className={styles.nameForm} onSubmit={formik.handleSubmit}>
            <div className={styles.nameEditRow}>
              <input
                className={styles.nameInput}
                id="traveller-name"
                name="name"
                type="text"
                autoFocus
                autoComplete="name"
                maxLength={32}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={Boolean(
                  formik.touched.name && formik.errors.name,
                )}
                aria-describedby={
                  formik.errors.name ? "traveller-name-error" : undefined
                }
              />
              <button
                type="submit"
                className={styles.nameActionButton}
                aria-label="Зберегти ім’я"
                title="Зберегти ім’я"
                disabled={formik.isSubmitting || profileMutation.isPending}
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                className={styles.nameCancelButton}
                aria-label="Скасувати редагування імені"
                title="Скасувати"
                onClick={cancelNameEdit}
                disabled={formik.isSubmitting || profileMutation.isPending}
              >
                ×
              </button>
            </div>
            {formik.touched.name && formik.errors.name && (
              <p className={styles.fieldError} id="traveller-name-error">
                {formik.errors.name}
              </p>
            )}
            {formik.status && (
              <p className={styles.fieldError}>{formik.status}</p>
            )}
          </form>
        ) : (
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{user.name}</h1>
            {isOwner && (
              <button
                type="button"
                className={styles.editNameButton}
                aria-label="Редагувати ім’я"
                title="Редагувати ім’я"
                onClick={startNameEdit}
              >
                <PencilIcon />
              </button>
            )}
          </div>
        )}
        <p className={styles.count}>Статей: {articlesCount}</p>
        {feedback && (
          <p
            className={
              feedback.isError ? styles.feedbackError : styles.feedbackSuccess
            }
            role={feedback.isError ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        )}
      </div>

      {isAvatarDialogOpen && isOwner && (
        <div className={styles.dialogBackdrop}>
          <section
            className={styles.avatarDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-dialog-title"
          >
            <button
              type="button"
              className={styles.dialogCloseButton}
              autoFocus
              aria-label="Закрити налаштування фото"
              onClick={closeAvatarDialog}
              disabled={profileMutation.isPending}
            >
              ×
            </button>
            <h2 className={styles.dialogTitle} id="avatar-dialog-title">
              Фото профілю
            </h2>
            <p className={styles.dialogDescription}>
              Оберіть фото, налаштуйте кадрування та збережіть зміни.
            </p>

            {selectedAvatar && cropImageUrl ? (
              <div className={styles.cropEditor}>
                <div
                  ref={cropFrameRef}
                  className={styles.cropFrame}
                  onPointerDown={handleCropPointerDown}
                  onPointerMove={handleCropPointerMove}
                  onPointerUp={() => {
                    pointerDragRef.current = null;
                  }}
                  onPointerCancel={() => {
                    pointerDragRef.current = null;
                  }}
                  role="group"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    const step = event.shiftKey ? 20 : 5;
                    const limits = imageMetrics;
                    if (!limits) return;
                    const directions: Record<string, CropOffset> = {
                      ArrowLeft: { x: -step, y: 0 },
                      ArrowRight: { x: step, y: 0 },
                      ArrowUp: { x: 0, y: -step },
                      ArrowDown: { x: 0, y: step },
                    };
                    const direction = directions[event.key];
                    if (!direction) return;
                    event.preventDefault();
                    setCropOffset((current) => ({
                      x: Math.max(
                        -limits.maxX,
                        Math.min(limits.maxX, current.x + direction.x),
                      ),
                      y: Math.max(
                        -limits.maxY,
                        Math.min(limits.maxY, current.y + direction.y),
                      ),
                    }));
                  }}
                  aria-label="Перетягніть фото або переміщуйте його стрілками"
                >
                  <Image
                    ref={cropImageRef}
                    src={cropImageUrl}
                    alt="Попередній перегляд кадрування аватара"
                    width={Math.ceil(imageMetrics?.width ?? CROP_SIZE)}
                    height={Math.ceil(imageMetrics?.height ?? CROP_SIZE)}
                    unoptimized
                    className={styles.cropImage}
                    draggable={false}
                    onError={() => {
                      setSelectedAvatar(null);
                      setFeedback({
                        message: "Не вдалося відкрити фото. Оберіть інше зображення.",
                        isError: true,
                      });
                    }}
                    onLoad={(event) =>
                      setImageSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      })
                    }
                    style={
                      imageMetrics
                        ? {
                            width: imageMetrics.width,
                            height: imageMetrics.height,
                            left: `calc(50% + ${cropOffset.x}px)`,
                            top: `calc(50% + ${cropOffset.y}px)`,
                          }
                        : undefined
                    }
                  />
                </div>
                <label className={styles.zoomLabel} htmlFor="avatar-zoom">
                  Масштаб
                  <span>{zoom.toFixed(1)}×</span>
                </label>
                <input
                  id="avatar-zoom"
                  className={styles.zoomSlider}
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={handleZoomChange}
                  aria-label="Масштаб фото"
                />
              </div>
            ) : (
              <div className={styles.emptyCropState}>
                <div className={styles.defaultPreview} aria-hidden="true">
                  <Image
                    src={user.avatarUrl || defaultAvatar}
                    alt=""
                    width={96}
                    height={96}
                    unoptimized
                  />
                </div>
                <p>JPG, PNG або WebP, до 10 МБ.</p>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={profileMutation.isPending}
                >
                  Обрати фото
                </button>
              </div>
            )}

            {feedback?.isError && (
              <p className={styles.dialogError} role="alert">
                {feedback.message}
              </p>
            )}

            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.resetAvatarButton}
                onClick={handleResetAvatar}
                disabled={profileMutation.isPending || !hasCustomAvatar}
              >
                Повернути стандартне фото
              </button>
              <div className={styles.dialogPrimaryActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeAvatarDialog}
                  disabled={profileMutation.isPending}
                >
                  Скасувати
                </button>
                {selectedAvatar && (
                  <button
                    type="button"
                    className={styles.saveAvatarButton}
                    onClick={handleSaveAvatar}
                    disabled={profileMutation.isPending || !imageSize.width}
                  >
                    {profileMutation.isPending
                      ? "Збереження…"
                      : "Зберегти фото"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
