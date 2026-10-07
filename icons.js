/* Встроенный набор иконок для бирок.
   Все иконки — штриховые SVG 24×24, рисуются цветом текста бирки (currentColor). */

window.ICONS = (function () {
  return {
    key: {
      name: { ru: "Ключ", en: "Key" },
      svg: '<circle cx="8.5" cy="8.5" r="4.5"/><path d="M11.7 11.7 20.5 20.5"/><path d="M17.5 17.5l-2.1 2.1"/><path d="M19.5 19.5l-2.1 2.1"/>'
    },
    home: {
      name: { ru: "Дом", en: "House" },
      svg: '<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M6 10.2V20h12v-9.8"/><path d="M10.2 20v-4.6h3.6V20"/>'
    },
    building: {
      name: { ru: "Офис", en: "Office" },
      svg: '<rect x="5.5" y="3.5" width="13" height="17" rx="1.2"/><path d="M9 7.5h1.6M13.4 7.5H15M9 11h1.6M13.4 11H15M9 14.5h1.6M13.4 14.5H15"/><path d="M10.5 20.5v-3.2h3v3.2"/>'
    },
    car: {
      name: { ru: "Авто", en: "Car" },
      svg: '<path d="M4.5 16v-3.2l1.9-4.5A2 2 0 0 1 8.3 7h7.4a2 2 0 0 1 1.9 1.3l1.9 4.5V16"/><path d="M4.5 12.6h15"/><circle cx="8" cy="17.6" r="2"/><circle cx="16" cy="17.6" r="2"/><path d="M10 17.6h4"/>'
    },
    truck: {
      name: { ru: "Грузовик", en: "Truck" },
      svg: '<path d="M2.5 16.5V7.5h10.5v9"/><path d="M13 11h3.7l3.3 3.8v1.7H13"/><path d="M2.5 16.5h1.6M8.4 16.5h5.1M19.4 16.5h1.1"/><circle cx="6.6" cy="17.9" r="1.9"/><circle cx="17.4" cy="17.9" r="1.9"/>'
    },
    bike: {
      name: { ru: "Велосипед", en: "Bicycle" },
      svg: '<circle cx="6" cy="16.5" r="4"/><circle cx="18" cy="16.5" r="4"/><path d="M6 16.5 10.5 9h5l2.5 7.5"/><path d="M10.5 16.5h4.5"/><path d="M8.8 7.6h3.2"/><path d="M14.6 9 16.4 7h1.8"/>'
    },
    boat: {
      name: { ru: "Яхта", en: "Boat" },
      svg: '<path d="M3.5 16.5h17l-2.6 4H6.1z"/><path d="M12 3.5v12"/><path d="M12.7 5 17.6 13.5h-4.9z"/>'
    },
    phone: {
      name: { ru: "Телефон", en: "Phone" },
      svg: '<rect x="6.5" y="2.8" width="11" height="18.4" rx="2"/><path d="M10.4 18.4h3.2"/>'
    },
    mail: {
      name: { ru: "Почта", en: "Mail" },
      svg: '<rect x="3" y="5.5" width="18" height="13" rx="1.6"/><path d="M3.6 7 12 13l8.4-6"/>'
    },
    star: {
      name: { ru: "Звезда", en: "Star" },
      svg: '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z"/>'
    },
    shield: {
      name: { ru: "Щит", en: "Shield" },
      svg: '<path d="M12 3.4 19 6v5.6c0 4.2-2.9 7.5-7 9.1-4.1-1.6-7-4.9-7-9.1V6z"/>'
    },
    check: {
      name: { ru: "Галочка", en: "Check" },
      svg: '<path d="m4.8 12.6 4.8 4.8L19.4 7"/>'
    },
    paw: {
      name: { ru: "Питомец", en: "Pet" },
      svg: '<circle cx="6.5" cy="11" r="2.2"/><circle cx="10" cy="7.4" r="2.2"/><circle cx="14" cy="7.4" r="2.2"/><circle cx="17.5" cy="11" r="2.2"/><path d="M12 12c2.6 0 4.6 1.9 4.6 4.1 0 2-1.7 3.4-3.7 3.1a11 11 0 0 0-3.8 0c-2 .3-3.7-1.1-3.7-3.1C7.4 13.9 9.4 12 12 12Z"/>'
    },
    tree: {
      name: { ru: "Сад", en: "Garden" },
      svg: '<path d="m12 3.2 4.6 5.8h-2.7l4.1 5.2h-2.7l4 5.3H6.7l4-5.3H8l4.1-5.2H9.4z"/><path d="M12 19.5v2.4"/>'
    },
    umbrella: {
      name: { ru: "Зонтик", en: "Umbrella" },
      svg: '<path d="M3.5 12.5a8.5 8.5 0 0 1 17 0z"/><path d="M12 12.5v5.6a2.1 2.1 0 0 1-4.2 0"/>'
    },
    locker: {
      name: { ru: "Ячейка", en: "Locker" },
      svg: '<rect x="5" y="3.5" width="14" height="17" rx="1.6"/><path d="M12 3.5v17"/><path d="M8.6 8h1.4M14 8h1.4"/><path d="M10.4 12.5h1.2M12.4 12.5h1.2"/>'
    },
    box: {
      name: { ru: "Склад", en: "Warehouse" },
      svg: '<path d="M12 3.2 20 7.4v9.2L12 20.8 4 16.6V7.4z"/><path d="m4 7.4 8 4.2 8-4.2"/><path d="M12 11.6v9.2"/>'
    },
    wrench: {
      name: { ru: "Мастерок", en: "Service" },
      svg: '<path d="M14.8 6.2a4.6 4.6 0 0 0-6 5.9L4 16.9a2.1 2.1 0 0 0 3 3l4.8-4.8a4.6 4.6 0 0 0 5.9-6l-2.9 2.9-2.6-.6-.6-2.6z"/>'
    },
    tag: {
      name: { ru: "Бирка", en: "Tag" },
      svg: '<path d="M11.4 3.5h9.1v8.7L12.1 20.6a1.7 1.7 0 0 1-2.4 0l-6.2-6.2a1.7 1.7 0 0 1 0-2.4z"/><circle cx="16.5" cy="8" r="1.7"/>'
    },
    lock: {
      name: { ru: "Замок", en: "Lock" },
      svg: '<rect x="5" y="10.5" width="14" height="10.2" rx="2"/><path d="M8.2 10.5V7.6a3.8 3.8 0 0 1 7.6 0v2.9"/><path d="M12 14.4v2.6"/>'
    }
  };
})();

window.ICON_ORDER = [
  "key", "home", "building", "car", "truck",
  "bike", "boat", "phone", "mail", "star",
  "shield", "check", "paw", "tree", "umbrella",
  "locker", "box", "wrench", "tag", "lock"
];
