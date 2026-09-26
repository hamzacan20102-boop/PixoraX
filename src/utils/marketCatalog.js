const categories = [
  {
    id: "evler",
    aliases: ["ev", "house", "houses"],
    label: "🏠 Evler",
    products: [
      { id: "kucuk-ev", name: "Küçük Ev", emoji: "🏚️", price: 250_000, description: "Kendi çatın; başlangıç seviyesi." },
      { id: "apartman", name: "Apartman Dairesi", emoji: "🏢", price: 1_500_000, description: "Şehir merkezinde bir daire." },
      { id: "mustakil-ev", name: "Müstakil Ev", emoji: "🏡", price: 8_000_000, description: "Bahçeli, geniş bir yaşam alanı." },
      { id: "villa", name: "Lüks Villa", emoji: "🏰", price: 45_000_000, description: "Özel havuzlu lüks yaşam." },
      { id: "malikane", name: "Boğaz Malikanesi", emoji: "🌆", price: 320_000_000, description: "Ekonominin en seçkin evlerinden." }
    ]
  },
  {
    id: "arabalar",
    aliases: ["araba", "arac", "araç", "cars"],
    label: "🚘 Arabalar",
    products: [
      { id: "bisiklet", name: "Şehir Bisikleti", emoji: "🚲", price: 80_000, description: "Uygun fiyatlı, iki tekerlekli ulaşım." },
      { id: "ikinci-el", name: "İkinci El Araba", emoji: "🚗", price: 450_000, description: "İlk otomobilin için makul seçenek." },
      { id: "sedan", name: "Premium Sedan", emoji: "🚙", price: 2_800_000, description: "Konforlu ve güçlü bir günlük araç." },
      { id: "spor-araba", name: "Spor Araba", emoji: "🏎️", price: 32_000_000, description: "Hızın ve prestijin pahalı hali." },
      { id: "hiper-araba", name: "Hiper Araba", emoji: "🏁", price: 260_000_000, description: "Garajın en nadir parçası." }
    ]
  },
  {
    id: "isyerleri",
    aliases: ["isyeri", "işyeri", "isyerleri", "business"],
    label: "🏬 İşyerleri",
    products: [
      { id: "kahve-standi", name: "Kahve Standı", emoji: "☕", price: 700_000, incomePerHour: 750, description: "Küçük bir girişim için ilk adım." },
      { id: "bakkal", name: "Mahalle Bakkalı", emoji: "🏪", price: 5_000_000, incomePerHour: 3_500, description: "Mahallenin günlük ihtiyaç noktası." },
      { id: "kafe", name: "Şehir Kafesi", emoji: "🧋", price: 18_000_000, incomePerHour: 12_000, description: "Popüler bir lokasyonda modern kafe." },
      { id: "restoran", name: "Fine Dining Restoran", emoji: "🍽️", price: 70_000_000, incomePerHour: 45_000, description: "Büyük sermayeli bir restoran yatırımı." },
      { id: "fabrika", name: "Üretim Fabrikası", emoji: "🏭", price: 420_000_000, incomePerHour: 180_000, description: "Büyük ölçekli sanayi yatırımı." }
    ]
  }
];

const products = categories.flatMap(category =>
  category.products.map(product => ({ ...product, categoryId: category.id, categoryLabel: category.label }))
);

function findCategory(value) {
  const normalized = String(value || "").toLocaleLowerCase("tr-TR");
  return categories.find(category => category.id === normalized || category.aliases.includes(normalized));
}

function findProduct(value) {
  const normalized = String(value || "").toLocaleLowerCase("tr-TR");
  return products.find(product => product.id === normalized);
}

module.exports = { categories, findCategory, findProduct, products };
