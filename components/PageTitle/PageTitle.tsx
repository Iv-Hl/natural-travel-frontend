type PageTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageTitle({ children, className }: PageTitleProps) {
  return <h1 className={className}>{children}</h1>;
}
