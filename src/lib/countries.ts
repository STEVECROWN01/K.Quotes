// Comprehensive country data with phone codes, flags, currencies, and major cities.
// Used by the form's country/town/phone dropdowns.

export type Country = {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  phoneCode: string;
  flag: string; // emoji flag
  currency: string; // ISO 4217 code
  currencySymbol: string;
  cities: string[];
  // Mobile payment methods available in this country
  mobilePayments: { id: string; name: string }[];
};

export const COUNTRIES: Country[] = [
  {
    name: "Bénin",
    code: "BJ",
    phoneCode: "+229",
    flag: "🇧🇯",
    currency: "XOF",
    currencySymbol: "FCFA",
    cities: ["Cotonou", "Porto-Novo", "Parakou", "Abomey", "Bohicon", "Kandi", "Lokossa", "Ouidah", "Natitingou", "Malanville"],
    mobilePayments: [
      { id: "mtn-momo", name: "MTN Mobile Money" },
      { id: "moov-money", name: "Moov Money" },
      { id: "celtiis", name: "Celtiis Cash" },
    ],
  },
  {
    name: "France",
    code: "FR",
    phoneCode: "+33",
    flag: "🇫🇷",
    currency: "EUR",
    currencySymbol: "€",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne"],
    mobilePayments: [
      { id: "lydia", name: "Lydia" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Grèce",
    code: "GR",
    phoneCode: "+30",
    flag: "🇬🇷",
    currency: "EUR",
    currencySymbol: "€",
    cities: ["Athènes", "Thessalonique", "Patras", "Héraklion", "Larissa", "Volos", "Ioannina", "Agrinio", "Kavala", "Chania", "Agia Paraskevi", "Dramas", "Veria", "Kalamaria", "Trikala"],
    mobilePayments: [
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Sénégal",
    code: "SN",
    phoneCode: "+221",
    flag: "🇸🇳",
    currency: "XOF",
    currencySymbol: "FCFA",
    cities: ["Dakar", "Touba", "Thiès", "Rufisque", "Kaolack", "Ziguinchor", "Saint-Louis", "Mbour", "Diourbel", "Louga", "Tambacounda", "Richard-Toll", "Tivaouane", "Ndioum", "Kaffrine"],
    mobilePayments: [
      { id: "wave", name: "Wave" },
      { id: "orange-money", name: "Orange Money" },
      { id: "free-money", name: "Free Money" },
    ],
  },
  {
    name: "Côte d'Ivoire",
    code: "CI",
    phoneCode: "+225",
    flag: "🇨🇮",
    currency: "XOF",
    currencySymbol: "FCFA",
    cities: ["Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo", "Man", "Divo", "Gagnoa", "Anyama", "Abengourou", "Agboville", "Grand-Bassam", "Dabou", "Séguéla"],
    mobilePayments: [
      { id: "orange-money", name: "Orange Money" },
      { id: "mtn-momo", name: "MTN Mobile Money" },
      { id: "moov-money", name: "Moov Money" },
      { id: "wave", name: "Wave" },
    ],
  },
  {
    name: "Togo",
    code: "TG",
    phoneCode: "+228",
    flag: "🇹🇬",
    currency: "XOF",
    currencySymbol: "FCFA",
    cities: ["Lomé", "Sokodé", "Kara", "Atakpamé", "Dapaong", "Tsévié", "Aného", "Mango", "Kpalimé", "Bassar", "Tabligbo", "Niamtougou", "Badou", "Sotouboua", "Vogan"],
    mobilePayments: [
      { id: "moov-money", name: "Moov Money" },
      { id: "tmoney", name: "T-Money" },
    ],
  },
  {
    name: "Burkina Faso",
    code: "BF",
    phoneCode: "+226",
    flag: "🇧🇫",
    currency: "XOF",
    currencySymbol: "FCFA",
    cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora", "Ouahigouya", "Pouytenga", "Kaya", "Tenkodogo", "Fada N'Gourma", "Houndé", "Dédougou", "Dori", "Koupéla", "Léo", "Manga"],
    mobilePayments: [
      { id: "orange-money", name: "Orange Money" },
      { id: "moov-money", name: "Moov Money" },
    ],
  },
  {
    name: "Mali",
    code: "ML",
    phoneCode: "+223",
    flag: "🇲🇱",
    currency: "XOF",
    currencySymbol: "FCFA",
    cities: ["Bamako", "Sikasso", "Kalabancoro", "Koutiala", "Ségou", "Kayes", "Mopti", "Niono", "Markala", "Bougouni", "Kati", "Kolokani", "Tombouctou", "Gao", "San"],
    mobilePayments: [
      { id: "orange-money", name: "Orange Money" },
      { id: "moov-money", name: "Moov Money" },
    ],
  },
  {
    name: "Niger",
    code: "NE",
    phoneCode: "+227",
    flag: "🇳🇪",
    currency: "XOF",
    currencySymbol: "FCFA",
    cities: ["Niamey", "Zinder", "Maradi", "Agadez", "Aladji", "Tahoua", "Birni-N'Konni", "Dosso", "Tessaoua", "Gaya", "Arlit", "Diffa", "Nguigmi", "Mainé-Soroa", "Tillabéri"],
    mobilePayments: [
      { id: "moov-money", name: "Moov Money" },
      { id: "airtel-money", name: "Airtel Money" },
    ],
  },
  {
    name: "Nigeria",
    code: "NG",
    phoneCode: "+234",
    flag: "🇳🇬",
    currency: "NGN",
    currencySymbol: "₦",
    cities: ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City", "Kaduna", "Maiduguri", "Zaria", "Aba", "Jos", "Ilorin", "Oyo", "Enugu", "Abeokuta", "Onitsha", "Warri", "Sokoto", "Calabar", "Katsina"],
    mobilePayments: [
      { id: "opay", name: "OPay" },
      { id: "paga", name: "Paga" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Ghana",
    code: "GH",
    phoneCode: "+233",
    flag: "🇬🇭",
    currency: "GHS",
    currencySymbol: "₵",
    cities: ["Accra", "Kumasi", "Tamale", "Takoradi", "Tema", "Sekondi", "Cape Coast", "Obuasi", "Teshie", "Madina", "Koforidua", "Sunyani", "Wa", "Ho", "Bolgatanga"],
    mobilePayments: [
      { id: "mtn-momo", name: "MTN Mobile Money" },
      { id: "telecel-cash", name: "Telecel Cash" },
      { id: "airteltigo", name: "AirtelTigo Money" },
    ],
  },
  {
    name: "Cameroun",
    code: "CM",
    phoneCode: "+237",
    flag: "🇨🇲",
    currency: "XAF",
    currencySymbol: "FCFA",
    cities: ["Douala", "Yaoundé", "Bamenda", "Bafoussam", "Garoua", "Maroua", "Ngaoundéré", "Kumba", "Buea", "Limbe", "Ebolowa", "Bertoua", "Kribi", "Loum", "Nkongsamba"],
    mobilePayments: [
      { id: "orange-money", name: "Orange Money" },
      { id: "mtn-momo", name: "MTN Mobile Money" },
    ],
  },
  {
    name: "Gabon",
    code: "GA",
    phoneCode: "+241",
    flag: "🇬🇦",
    currency: "XAF",
    currencySymbol: "FCFA",
    cities: ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda", "Mouila", "Lambaréné", "Tchibanga", "Koulamoutou", "Makokou", "Bitam", "Gamba", "Ntoum", "Ndjolé", "Mounana"],
    mobilePayments: [
      { id: "airtel-money", name: "Airtel Money" },
      { id: "moov-money", name: "Moov Money" },
    ],
  },
  {
    name: "Congo",
    code: "CG",
    phoneCode: "+242",
    flag: "🇨🇬",
    currency: "XAF",
    currencySymbol: "FCFA",
    cities: ["Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Impfondo", "Ouesso", "Madingou", "Loubomo", "Gamboma", "Sibiti", "Owando", "Mossendjo", "Kinkala", "Djambala", "Makoua"],
    mobilePayments: [
      { id: "airtel-money", name: "Airtel Money" },
      { id: "mtn-momo", name: "MTN Mobile Money" },
    ],
  },
  {
    name: "RD Congo",
    code: "CD",
    phoneCode: "+243",
    flag: "🇨🇩",
    currency: "CDF",
    currencySymbol: "FC",
    cities: ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Bukavu", "Tshikapa", "Kolwezi", "Likasi", "Goma", "Beni", "Uvira", "Matadi", "Mbandaka", "Boma"],
    mobilePayments: [
      { id: "orange-money", name: "Orange Money" },
      { id: "airtel-money", name: "Airtel Money" },
      { id: "mpesa", name: "M-Pesa" },
      { id: "vodacom", name: "Vodacom M-Pesa" },
    ],
  },
  {
    name: "Tchad",
    code: "TD",
    phoneCode: "+235",
    flag: "🇹🇩",
    currency: "XAF",
    currencySymbol: "FCFA",
    cities: ["N'Djamena", "Moundou", "Sarh", "Abéché", "Kelo", "Doba", "Mongo", "Bongor", "Faya-Largeau", "Lai", "Biltine", "Ati", "Am Timan", "Kyabé", "Oum Hadjer"],
    mobilePayments: [
      { id: "airtel-money", name: "Airtel Money" },
      { id: "moov-money", name: "Moov Money" },
    ],
  },
  {
    name: "Maroc",
    code: "MA",
    phoneCode: "+212",
    flag: "🇲🇦",
    currency: "MAD",
    currencySymbol: "DH",
    cities: ["Casablanca", "Rabat", "Fès", "Marrakech", "Agadir", "Tanger", "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "Mohammedia", "Khouribga", "El Jadida", "Béni Mellal"],
    mobilePayments: [
      { id: "inwi-money", name: "Inwi Money" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Algérie",
    code: "DZ",
    phoneCode: "+213",
    flag: "🇩🇿",
    currency: "DZD",
    currencySymbol: "DA",
    cities: ["Alger", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Sétif", "Sidi Bel Abbès", "Skikda", "Tlemcen", "Béjaïa", "Tiaret", "Biskra", "Tizi Ouzou", "Ouargla"],
    mobilePayments: [
      { id: "edahabia", name: "Edahabia" },
      { id: "baridiMob", name: "BaridiMob" },
    ],
  },
  {
    name: "Tunisie",
    code: "TN",
    phoneCode: "+216",
    flag: "🇹🇳",
    currency: "TND",
    currencySymbol: "DT",
    cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana", "Gafsa", "Monastir", "Ben Arous", "La Marsa", "Nabeul", "Médenine", "Tataouine", "Béja"],
    mobilePayments: [
      { id: "d17", name: "D17" },
      { id: "konnect", name: "Konnect" },
    ],
  },
  {
    name: "États-Unis",
    code: "US",
    phoneCode: "+1",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Boston"],
    mobilePayments: [
      { id: "venmo", name: "Venmo" },
      { id: "cashapp", name: "Cash App" },
      { id: "paypal", name: "PayPal" },
      { id: "zelle", name: "Zelle" },
    ],
  },
  {
    name: "Canada",
    code: "CA",
    phoneCode: "+1",
    flag: "🇨🇦",
    currency: "CAD",
    currencySymbol: "$ CA",
    cities: ["Toronto", "Montréal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Mississauga", "Winnipeg", "Québec", "Hamilton", "Halifax", "Victoria", "Saskatoon", "Regina", "St. John's"],
    mobilePayments: [
      { id: "paypal", name: "PayPal" },
      { id: "interac", name: "Interac e-Transfer" },
    ],
  },
  {
    name: "Royaume-Uni",
    code: "GB",
    phoneCode: "+44",
    flag: "🇬🇧",
    currency: "GBP",
    currencySymbol: "£",
    cities: ["Londres", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh", "Bristol", "Cardiff", "Belfast", "Leicester", "Coventry", "Bradford", "Nottingham"],
    mobilePayments: [
      { id: "paypal", name: "PayPal" },
      { id: "monzo", name: "Monzo" },
    ],
  },
  {
    name: "Belgique",
    code: "BE",
    phoneCode: "+32",
    flag: "🇧🇪",
    currency: "EUR",
    currencySymbol: "€",
    cities: ["Bruxelles", "Anvers", "Gand", "Charleroi", "Liège", "Bruges", "Namur", "Louvain", "Mons", "Alost", "Malines", "La Louvière", "Kortrijk", "Ostende", "Tournai"],
    mobilePayments: [
      { id: "paypal", name: "PayPal" },
      { id: "payconiq", name: "Payconiq" },
    ],
  },
  {
    name: "Suisse",
    code: "CH",
    phoneCode: "+41",
    flag: "🇨🇭",
    currency: "CHF",
    currencySymbol: "CHF",
    cities: ["Zurich", "Genève", "Bâle", "Lausanne", "Berne", "Winterthour", "Lucerne", "Saint-Gall", "Lugano", "Bienne", "Fribourg", "La Chaux-de-Fonds", "Schaffhouse", "Vernier", "Sion"],
    mobilePayments: [
      { id: "twint", name: "TWINT" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Allemagne",
    code: "DE",
    phoneCode: "+49",
    flag: "🇩🇪",
    currency: "EUR",
    currencySymbol: "€",
    cities: ["Berlin", "Hambourg", "Munich", "Cologne", "Francfort", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen", "Brême", "Dresde", "Hannovre", "Nuremberg", "Duisbourg"],
    mobilePayments: [
      { id: "paypal", name: "PayPal" },
      { id: "klarna", name: "Klarna" },
    ],
  },
  {
    name: "Espagne",
    code: "ES",
    phoneCode: "+34",
    flag: "🇪🇸",
    currency: "EUR",
    currencySymbol: "€",
    cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón"],
    mobilePayments: [
      { id: "bizum", name: "Bizum" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Italie",
    code: "IT",
    phoneCode: "+39",
    flag: "🇮🇹",
    currency: "EUR",
    currencySymbol: "€",
    cities: ["Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania", "Venezia", "Verona", "Pisa", "Padova", "Trieste"],
    mobilePayments: [
      { id: "satispay", name: "Satispay" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Portugal",
    code: "PT",
    phoneCode: "+351",
    flag: "🇵🇹",
    currency: "EUR",
    currencySymbol: "€",
    cities: ["Lisboa", "Porto", "Braga", "Coimbra", "Funchal", "Setúbal", "Aveiro", "Faro", "Leiria", "Évora", "Viseu", "Viana do Castelo", "Castelo Branco", "Beja", "Portalegre"],
    mobilePayments: [
      { id: "mb-way", name: "MB WAY" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Kenya",
    code: "KE",
    phoneCode: "+254",
    flag: "🇰🇪",
    currency: "KES",
    currencySymbol: "KSh",
    cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Ruiru", "Kikuyu", "Kangundo-Tala", "Malindi", "Naivasha", "Kitui", "Machakos", "Thika", "Kilifi", "Bungoma"],
    mobilePayments: [
      { id: "mpesa", name: "M-Pesa" },
      { id: "airtel-money", name: "Airtel Money" },
      { id: "tkash", name: "T-Kash" },
    ],
  },
  {
    name: "Afrique du Sud",
    code: "ZA",
    phoneCode: "+27",
    flag: "🇿🇦",
    currency: "ZAR",
    currencySymbol: "R",
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Pietermaritzburg", "Polokwane", "Nelspruit", "Kimberley", "Rustenburg", "Soweto", "Tembisa", "Vereeniging"],
    mobilePayments: [
      { id: "zapper", name: "Zapper" },
      { id: "snapscan", name: "SnapScan" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Égypte",
    code: "EG",
    phoneCode: "+20",
    flag: "🇪🇬",
    currency: "EGP",
    currencySymbol: "E£",
    cities: ["Le Caire", "Alexandrie", "Gizeh", "Shubra El-Kheima", "Port-Saïd", "Suez", "Mansourah", "El-Mahalla El-Kubra", "Tanta", "Asyut", "Ismailia", "Fayoum", "Zagazig", "Assouan", "Damanhur"],
    mobilePayments: [
      { id: "fawry", name: "Fawry" },
      { id: "vodacom", name: "Vodafone Cash" },
    ],
  },
  {
    name: "Émirats Arabes Unis",
    code: "AE",
    phoneCode: "+971",
    flag: "🇦🇪",
    currency: "AED",
    currencySymbol: "د.إ",
    cities: ["Dubaï", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras al-Khaimah", "Fujairah", "Umm al-Quwain", "Khor Fakkan", "Kalba", "Dibba Al-Fujairah", "Madinat Zayed", "Ruwais", "Liwa Oasis", "Hatta"],
    mobilePayments: [
      { id: "apple-pay", name: "Apple Pay" },
      { id: "samsung-pay", name: "Samsung Pay" },
    ],
  },
  {
    name: "Brésil",
    code: "BR",
    phoneCode: "+55",
    flag: "🇧🇷",
    currency: "BRL",
    currencySymbol: "R$",
    cities: ["São Paulo", "Rio de Janeiro", "Salvador", "Brasília", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre", "Belém", "Goiânia", "Guarulhos", "Campinas", "São Luís"],
    mobilePayments: [
      { id: "pix", name: "Pix" },
      { id: "paypal", name: "PayPal" },
    ],
  },
  {
    name: "Chine",
    code: "CN",
    phoneCode: "+86",
    flag: "🇨🇳",
    currency: "CNY",
    currencySymbol: "¥",
    cities: ["Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Tianjin", "Wuhan", "Dongguan", "Chengdu", "Chongqing", "Nanjing", "Hangzhou", "Xi'an", "Shenyang", "Suzhou", "Harbin"],
    mobilePayments: [
      { id: "wechat-pay", name: "WeChat Pay" },
      { id: "alipay", name: "Alipay" },
    ],
  },
  {
    name: "Inde",
    code: "IN",
    phoneCode: "+91",
    flag: "🇮🇳",
    currency: "INR",
    currencySymbol: "₹",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane"],
    mobilePayments: [
      { id: "upi", name: "UPI" },
      { id: "phonepe", name: "PhonePe" },
      { id: "paytm", name: "Paytm" },
    ],
  },
  {
    name: "Russie",
    code: "RU",
    phoneCode: "+7",
    flag: "🇷🇺",
    currency: "RUB",
    currencySymbol: "₽",
    cities: ["Moscou", "Saint-Pétersbourg", "Novossibirsk", "Iekaterinbourg", "Nijni Novgorod", "Kazan", "Tcheliabinsk", "Omsk", "Samara", "Rostov-sur-le-Don", "Oufa", "Krasnoïarsk", "Voronej", "Perm", "Volgograd"],
    mobilePayments: [
      { id: "yoomoney", name: "YooMoney" },
      { id: "mir-pay", name: "Mir Pay" },
    ],
  },
  {
    name: "Australie",
    code: "AU",
    phoneCode: "+61",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "A$",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra", "Sunshine Coast", "Wollongong", "Hobart", "Geelong", "Townsville", "Cairns", "Darwin"],
    mobilePayments: [
      { id: "paypal", name: "PayPal" },
      { id: "beem", name: "Beem It" },
    ],
  },
  {
    name: "Turquie",
    code: "TR",
    phoneCode: "+90",
    flag: "🇹🇷",
    currency: "TRY",
    currencySymbol: "₺",
    cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Konya", "Adana", "Şanlıurfa", "Gaziantep", "Mersin", "Diyarbakır", "Kayseri", "Eskişehir", "Samsun", "Denizli"],
    mobilePayments: [
      { id: "papara", name: "Papara" },
      { id: "ininal", name: "ininal" },
    ],
  },
  {
    name: "Arabie Saoudite",
    code: "SA",
    phoneCode: "+966",
    flag: "🇸🇦",
    currency: "SAR",
    currencySymbol: "﷼",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Buraidah", "Khamis Mushait", "Hail", "Hofuf", "Mubarraz", "Taif", "Najran", "Yanbu"],
    mobilePayments: [
      { id: "mada", name: "Mada Pay" },
      { id: "stc-pay", name: "STC Pay" },
      { id: "apple-pay", name: "Apple Pay" },
    ],
  },
  {
    name: "Liban",
    code: "LB",
    phoneCode: "+961",
    flag: "🇱🇧",
    currency: "LBP",
    currencySymbol: "ل.ل",
    cities: ["Beyrouth", "Tripoli", "Sidon", "Tyre", "Nabatieh", "Zahle", "Baabda", "Jounieh", "Baalbek", "Batroun", "Byblos", "Aley", "Chouf", "Hermel", "Bcharre"],
    mobilePayments: [
      { id: " paypal", name: "PayPal" },
    ],
  },
  {
    name: "Guinée",
    code: "GN",
    phoneCode: "+224",
    flag: "🇬🇳",
    currency: "GNF",
    currencySymbol: "FG",
    cities: ["Conakry", "Nzérékoré", "Kankan", "Kindia", "Boké", "Guéckédou", "Macenta", "Labé", "Siguiri", "Fria", "Mamou", "Kissidougou", "Dabola", "Télimélé", "Koubia"],
    mobilePayments: [
      { id: "orange-money", name: "Orange Money" },
      { id: "mtn-momo", name: "MTN Mobile Money" },
    ],
  },
  {
    name: "Mauritanie",
    code: "MR",
    phoneCode: "+222",
    flag: "🇲🇷",
    currency: "MRU",
    currencySymbol: "UM",
    cities: ["Nouakchott", "Nouadhibou", "Rosso", "Kaédi", "Zouérat", "Atar", "Néma", "Aleg", "Sélibaby", "Akjoujt", "Boutilimit", "Tidjikja", "Tichit", "Boghé", "Bareina"],
    mobilePayments: [
      { id: "bankily", name: "Bankily" },
      { id: "masrvi", name: "Masrvi" },
    ],
  },
  {
    name: "Liberia",
    code: "LR",
    phoneCode: "+231",
    flag: "🇱🇷",
    currency: "LRD",
    currencySymbol: "L$",
    cities: ["Monrovia", "Gbarnga", "Kakata", "Bensonville", "Harper", "Voinjama", "Buchanan", "Zwedru", "Greenville", "Robertsport", "Sanniquellie", "Fish Town", "Karnplay", "Barclayville", "Foya"],
    mobilePayments: [
      { id: "lonestar", name: "Lonestar Cell MTN Money" },
      { id: "orange-money", name: "Orange Money" },
    ],
  },
  {
    name: "Sierra Leone",
    code: "SL",
    phoneCode: "+232",
    flag: "🇸🇱",
    currency: "SLL",
    currencySymbol: "Le",
    cities: ["Freetown", "Bo", "Kenema", "Makeni", "Koidu", "Lunsar", "Kabala", "Magburaka", "Port Loko", "Pujehun", "Moyamba", "Bonthe", "Kambia", "Kailahun", "Kono"],
    mobilePayments: [
      { id: "orange-money", name: "Orange Money" },
      { id: "africell-money", name: "Africell Money" },
    ],
  },
];

// Helper: find country by name or code (fuzzy matching)
export function findCountry(query: string): Country | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === q ||
      c.code.toLowerCase() === q ||
      `${c.name} (${c.code})`.toLowerCase() === q ||
      // Fuzzy: partial match on name
      c.name.toLowerCase().includes(q) ||
      q.includes(c.name.toLowerCase())
  );
}

// Helper: format country for dropdown display
export function formatCountryLabel(c: Country): string {
  return `${c.flag} ${c.name} (${c.code})`;
}

// Helper: get mobile payment methods for a country
export function getMobilePayments(countryName: string): { id: string; name: string }[] {
  const country = findCountry(countryName);
  return country?.mobilePayments ?? [];
}
