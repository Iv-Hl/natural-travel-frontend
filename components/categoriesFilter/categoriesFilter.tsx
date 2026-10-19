// "use client";

// import React from "react";
// import styles from "./CategoriesFilter.module.css";

// export const CategoriesFilter = ({
//   categories = [],
//   selectedCategory,
//   onSelectCategory,
// }) => {
//   return (
//     <div className={styles.filterContainer}>
//       {/* Мобільна версія: випадаючий список (select) */}
//       <div className={styles.mobileSelectWrapper}>
//         <select
//           className={styles.mobileSelect}
//           value={selectedCategory || ""}
//           onChange={(e) => onSelectCategory(e.target.value)}
//         >
//           <option value="">Всі статті</option>
//           {categories.map((cat) => {
//             const catValue = cat.slug || cat.name;
//             return (
//               <option key={cat._id || catValue} value={catValue}>
//                 {cat.name}
//               </option>
//             );
//           })}
//         </select>
//       </div>

//       {/* Десктопна / планшетна версія: список кнопок */}
//       <div className={styles.buttonsList}>
//         <button
//           type="button"
//           className={`${styles.categoryButton} ${!selectedCategory ? styles.active : ""}`}
//           onClick={() => onSelectCategory("")}
//         >
//           Всі статті
//         </button>
//         {categories.map((cat) => {
//           const catValue = cat.slug || cat.name;
//           const isSelected = selectedCategory === catValue;
//           return (
//             <button
//               type="button"
//               key={cat._id || catValue}
//               className={`${styles.categoryButton} ${isSelected ? styles.active : ""}`}
//               onClick={() => onSelectCategory(catValue)}
//             >
//               {cat.name}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
