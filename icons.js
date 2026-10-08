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
    },
    hammer: {
      name: { ru: "Молоток", en: "Hammer" },
      svg: '<rect x="5" y="4.5" width="14" height="4" rx="2"/><path d="M12 8.5V20.5"/>'
    },
    screwdriver: {
      name: { ru: "Отвёртка", en: "Screwdriver" },
      svg: '<rect x="8.8" y="3" width="6.4" height="8.5" rx="1.8"/><path d="M12 11.5v6"/><path d="M10.4 17.5h3.2l-1.6 3.2z"/>'
    },
    gear: {
      name: { ru: "Шестерня", en: "Gear" },
      svg: '<circle cx="12" cy="12" r="3.1"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"/>'
    },
    fire: {
      name: { ru: "Огонь", en: "Fire" },
      svg: '<path d="M12 3.4c2 2.9 4.8 5.1 4.8 8.9a4.8 4.8 0 0 1-9.6 0c0-1.4.5-2.5 1-3.6-.3 1 0 2.3 1.9 2.3C10.8 7.5 11.2 5.4 12 3.4Z"/>'
    },
    drop: {
      name: { ru: "Вода", en: "Water" },
      svg: '<path d="M12 3.2c3.2 3.6 5.6 6.4 5.6 9.4a5.6 5.6 0 0 1-11.2 0c0-3 2.4-5.8 5.6-9.4Z"/>'
    },
    snowflake: {
      name: { ru: "Снежинка", en: "Snowflake" },
      svg: '<path d="M12 3.2v17.6M4.6 7.2l14.8 9.6M4.6 16.8l14.8-9.6"/><path d="M12 6 9.6 4.2M12 6l2.4-1.8M12 18l-2.4 1.8M12 18l2.4 1.8M6.8 9.2l1.4 1M17.2 14.8l1.4 1M6.8 14.8l1.4-1M17.2 9.2l1.4-1"/>'
    },
    sun: {
      name: { ru: "Солнце", en: "Sun" },
      svg: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9"/>'
    },
    leaf: {
      name: { ru: "Лист", en: "Leaf" },
      svg: '<path d="M4.5 19.5C4.5 10 10 4.5 19.5 4.5c0 9.5-5.5 15-15 15Z"/><path d="M4.5 19.5c3-5 8-9 11-11"/>'
    },
    bell: {
      name: { ru: "Звонок", en: "Bell" },
      svg: '<path d="M6.5 15.5v-5a5.5 5.5 0 0 1 11 0v5l1.7 2.5H4.8z"/><path d="M10.3 20.4a1.8 1.8 0 0 0 3.4 0"/>'
    },
    heart: {
      name: { ru: "Сердце", en: "Heart" },
      svg: '<path d="M12 20.2 4.7 13a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8a4.6 4.6 0 0 1 6.5 6.5z"/>'
    },
    flag: {
      name: { ru: "Флаг", en: "Flag" },
      svg: '<path d="M5.5 3.5v17"/><path d="M5.5 4.5h12.2l-2.7 4 2.7 4H5.5"/>'
    },
    camera: {
      name: { ru: "Камера", en: "Camera" },
      svg: '<rect x="3.5" y="7" width="17" height="12.5" rx="2"/><path d="M8 7l1.8-2.6h4.4L16 7"/><circle cx="12" cy="13.2" r="3.5"/>'
    },
    wifi: {
      name: { ru: "Wi-Fi", en: "Wi-Fi" },
      svg: '<path d="M4 9.5a11 11 0 0 1 16 0M7.2 13a7 7 0 0 1 9.6 0M10.3 16.1a3 3 0 0 1 3.4 0"/><circle cx="12" cy="18.8" r="1.3"/>'
    },
    battery: {
      name: { ru: "Батарея", en: "Battery" },
      svg: '<rect x="2.8" y="7.5" width="15" height="9" rx="1.5"/><path d="M17.8 10.5h1.8a.9.9 0 0 1 .9.9v1.2a.9.9 0 0 1-.9.9h-1.8"/><path d="M6.6 10.5v3M10.6 10.5v3"/>'
    },
    plug: {
      name: { ru: "Розетка", en: "Plug" },
      svg: '<path d="M8.2 3v4.6M15.8 3v4.6"/><rect x="5.5" y="7.6" width="13" height="11.4" rx="2.4"/><path d="M10.8 12.8h2.4"/>'
    },
    plane: {
      name: { ru: "Самолёт", en: "Plane" },
      svg: '<path d="m3.5 12 17-8-4.3 16-3.5-6.2L7 15.8z"/>'
    },
    bus: {
      name: { ru: "Автобус", en: "Bus" },
      svg: '<rect x="3.8" y="5" width="16.4" height="13" rx="2"/><path d="M3.8 10.6h16.4"/><path d="M7.4 7.8h3M13.6 7.8h3"/><path d="M6.9 14.4h1.7M15.4 14.4h1.7"/><circle cx="8" cy="17.3" r="1.15"/><circle cx="16" cy="17.3" r="1.15"/>'
    },
    moto: {
      name: { ru: "Мотоцикл", en: "Motorcycle" },
      svg: '<circle cx="5.8" cy="16.5" r="3.6"/><circle cx="17.6" cy="16.5" r="3.6"/><path d="M8.5 13.2 11.6 7.8h3.6l1.9 4.4"/><path d="M9.2 16.5h4.8"/><path d="M2.6 14.8h2.4"/>'
    },
    ship: {
      name: { ru: "Корабль", en: "Ship" },
      svg: '<path d="M3.8 17.5h16.4l-2.2 3H6z"/><path d="M12 5.5v12"/><path d="M12 7 16.6 14h-9.2z"/><path d="M12 3.5v1.6"/>'
    },
    scissors: {
      name: { ru: "Ножницы", en: "Scissors" },
      svg: '<circle cx="6.5" cy="6.5" r="2.8"/><circle cx="6.5" cy="17.5" r="2.8"/><path d="M8.8 8.2 20 18M8.8 15.8 20 6"/>'
    },
    valve: {
      name: { ru: "Вентиль", en: "Valve" },
      svg: '<path d="M11 3h2l1.6 5.8a3 3 0 0 1-5.2 0z"/><path d="M5.5 10h13"/><path d="M7 10l1 7h8l1-7"/><path d="M9.5 17v3h5v-3"/>'
    },
    antenna: {
      name: { ru: "Антенна", en: "Antenna" },
      svg: '<path d="M8.5 3c.4 1.2.4 3.4 0 5M12 3c1.6 1.2 1.6 3.8 0 5M15.5 3c-.4 1.2-.4 3.4 0 5"/><rect x="9" y="8" width="6" height="8.5" rx="1.3"/><path d="M9 12h6"/><path d="M10.8 16.5v3.5"/>'
    },
    music: {
      name: { ru: "Музыка", en: "Music" },
      svg: '<circle cx="9.5" cy="17.5" r="2.5"/><path d="M9.5 17.5V5.2L18 4v12.5"/><circle cx="15.5" cy="16.2" r="2.5"/>'
    },
    server: {
      name: { ru: "Сервер", en: "Server" },
      svg: '<rect x="4.5" y="4" width="15" height="6.5" rx="1.4"/><rect x="4.5" y="13.5" width="15" height="6.5" rx="1.4"/><path d="M8.5 7.2h.6M11.4 7.2h3M8.5 16.7h.6M11.4 16.7h3"/>'
    },
    puzzle: {
      name: { ru: "Пазл", en: "Puzzle" },
      svg: '<path d="M9.6 3.5v1.7a1.7 1.7 0 0 0 3.4 0V3.5h7.5v7.5h-1.7a1.7 1.7 0 0 0 0 3.4h1.7v7.5h-7.5v-1.7a1.7 1.7 0 0 0-3.4 0v1.7H3.5v-7.5h1.7a1.7 1.7 0 0 0 0-3.4H3.5V3.5z"/>'
    }
  };
})();

window.ICON_ORDER = [
  "key", "home", "building", "car", "truck",
  "bike", "boat", "phone", "mail", "star",
  "shield", "check", "paw", "tree", "umbrella",
  "locker", "box", "wrench", "tag", "lock",
  "hammer", "screwdriver", "gear", "fire", "drop",
  "snowflake", "sun", "leaf", "bell", "heart",
  "flag", "camera", "wifi", "battery", "plug",
  "plane", "bus", "moto", "ship", "scissors",
  "valve", "antenna", "music", "server", "puzzle"
];