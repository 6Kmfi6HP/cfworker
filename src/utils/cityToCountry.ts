// 城市到国家的映射函数，支持i18n
export const getCityToCountry = (t: any) => ({
  // 欧洲
  "Frankfurt": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  "Amsterdam": {code: "NL", name: t('countries.netherlands', '荷兰'), emoji: "🇳🇱"},
  "Paris": {code: "FR", name: t('countries.france', '法国'), emoji: "🇫🇷"},
  "Stockholm": {code: "SE", name: t('countries.sweden', '瑞典'), emoji: "🇸🇪"},
  "Helsinki": {code: "FI", name: t('countries.finland', '芬兰'), emoji: "🇫🇮"},
  "Warsaw": {code: "PL", name: t('countries.poland', '波兰'), emoji: "🇵🇱"},
  "London": {code: "GB", name: t('countries.uk', '英国'), emoji: "🇬🇧"},
  "Vilnius": {code: "LT", name: t('countries.lithuania', '立陶宛'), emoji: "🇱🇹"},
  "Istanbul": {code: "TR", name: t('countries.turkey', '土耳其'), emoji: "🇹🇷"},
  "Madrid": {code: "ES", name: t('countries.spain', '西班牙'), emoji: "🇪🇸"},
  "Zurich": {code: "CH", name: t('countries.switzerland', '瑞士'), emoji: "🇨🇭"},
  "Hamburg": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  "Riga": {code: "LV", name: t('countries.latvia', '拉脱维亚'), emoji: "🇱🇻"},
  "Copenhagen": {code: "DK", name: t('countries.denmark', '丹麦'), emoji: "🇩🇰"},
  "Bucharest": {code: "RO", name: t('countries.romania', '罗马尼亚'), emoji: "🇷🇴"},
  "Vienna": {code: "AT", name: t('countries.austria', '奥地利'), emoji: "🇦🇹"},
  "Milan": {code: "IT", name: t('countries.italy', '意大利'), emoji: "🇮🇹"},
  "Oslo": {code: "NO", name: t('countries.norway', '挪威'), emoji: "🇳🇴"},
  "Sofia": {code: "BG", name: t('countries.bulgaria', '保加利亚'), emoji: "🇧🇬"},
  "Tallinn": {code: "EE", name: t('countries.estonia', '爱沙尼亚'), emoji: "🇪🇪"},
  "Moscow": {code: "RU", name: t('countries.russia', '俄罗斯'), emoji: "🇷🇺"},
  "Lyon": {code: "FR", name: t('countries.france', '法国'), emoji: "🇫🇷"},
  "Chișinău": {code: "MD", name: t('countries.moldova', '摩尔多瓦'), emoji: "🇲🇩"},
  "Rome": {code: "IT", name: t('countries.italy', '意大利'), emoji: "🇮🇹"},
  "Budapest": {code: "HU", name: t('countries.hungary', '匈牙利'), emoji: "🇭🇺"},
  "Dublin": {code: "IE", name: t('countries.ireland', '爱尔兰'), emoji: "🇮🇪"},
  "Marseille": {code: "FR", name: t('countries.france', '法国'), emoji: "🇫🇷"},
  "Kyiv": {code: "UA", name: t('countries.ukraine', '乌克兰'), emoji: "🇺🇦"},
  "Düsseldorf": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  "Saint Petersburg": {code: "RU", name: t('countries.russia', '俄罗斯'), emoji: "🇷🇺"},
  "Geneva": {code: "CH", name: t('countries.switzerland', '瑞士'), emoji: "🇨🇭"},
  "Manchester": {code: "GB", name: t('countries.uk', '英国'), emoji: "🇬🇧"},
  "Berlin": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  "Prague": {code: "CZ", name: t('countries.czechia', '捷克'), emoji: "🇨🇿"},
  "Palermo": {code: "IT", name: t('countries.italy', '意大利'), emoji: "🇮🇹"},
  "Nicosia": {code: "CY", name: t('countries.cyprus', '塞浦路斯'), emoji: "🇨🇾"},
  "Bratislava": {code: "SK", name: t('countries.slovakia', '斯洛伐克'), emoji: "🇸🇰"},
  "Munich": {code: "DE", name: t('countries.germany', '德国'), emoji: "🇩🇪"},
  
  // 亚太
  "Seoul": {code: "KR", name: t('countries.southKorea', '韩国'), emoji: "🇰🇷"},
  "Singapore": {code: "SG", name: t('countries.singapore', '新加坡'), emoji: "🇸🇬"},
  "Tokyo": {code: "JP", name: t('countries.japan', '日本'), emoji: "🇯🇵"},
  "Hong Kong": {code: "HK", name: t('countries.hongKong', '香港'), emoji: "🇭🇰"},
  "Fukuoka": {code: "JP", name: t('countries.japan', '日本'), emoji: "🇯🇵"},
  "Osaka": {code: "JP", name: t('countries.japan', '日本'), emoji: "🇯🇵"},
  "Mumbai": {code: "IN", name: t('countries.india', '印度'), emoji: "🇮🇳"},
  "Taipei": {code: "TW", name: t('countries.taiwan', '台湾'), emoji: "🇹🇼"},
  "Yerevan": {code: "AM", name: t('countries.armenia', '亚美尼亚'), emoji: "🇦🇲"},
  "Bangkok": {code: "TH", name: t('countries.thailand', '泰国'), emoji: "🇹🇭"},
  "Chennai": {code: "IN", name: t('countries.india', '印度'), emoji: "🇮🇳"},
  "Bangalore": {code: "IN", name: t('countries.india', '印度'), emoji: "🇮🇳"},
  "Jakarta": {code: "ID", name: t('countries.indonesia', '印度尼西亚'), emoji: "🇮🇩"},
  "Kaohsiung City": {code: "TW", name: t('countries.taiwan', '台湾'), emoji: "🇹🇼"},
  "Almaty": {code: "KZ", name: t('countries.kazakhstan', '哈萨克斯坦'), emoji: "🇰🇿"},
  "Muscat": {code: "OM", name: t('countries.oman', '阿曼'), emoji: "🇴🇲"},
  "Hyderabad": {code: "IN", name: t('countries.india', '印度'), emoji: "🇮🇳"},
  "Tel Aviv": {code: "IL", name: t('countries.israel', '以色列'), emoji: "🇮🇱"},
  "Haifa": {code: "IL", name: t('countries.israel', '以色列'), emoji: "🇮🇱"},
  "Aktobe": {code: "KZ", name: t('countries.kazakhstan', '哈萨克斯坦'), emoji: "🇰🇿"},
  
  // 北美
  "Los Angeles": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "San Jose": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Ashburn": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Toronto": {code: "CA", name: t('countries.canada', '加拿大'), emoji: "🇨🇦"},
  "Seattle": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Portland": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Newark": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Miami": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Dallas": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Buffalo": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Atlanta": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Denver": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Montréal": {code: "CA", name: t('countries.canada', '加拿大'), emoji: "🇨🇦"},
  "Chicago": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Norfolk": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Phoenix": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Kansas City": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Columbus": {code: "US", name: t('countries.usa', '美国'), emoji: "🇺🇸"},
  "Vancouver": {code: "CA", name: t('countries.canada', '加拿大'), emoji: "🇨🇦"},
  
  // 大洋洲
  "Sydney": {code: "AU", name: t('countries.australia', '澳大利亚'), emoji: "🇦🇺"},
  "Melbourne": {code: "AU", name: t('countries.australia', '澳大利亚'), emoji: "🇦🇺"},
  "Auckland": {code: "NZ", name: t('countries.newZealand', '新西兰'), emoji: "🇳🇿"},
  
  // 南美
  "São Paulo": {code: "BR", name: t('countries.brazil', '巴西'), emoji: "🇧🇷"},
  "Bogota": {code: "CO", name: t('countries.colombia', '哥伦比亚'), emoji: "🇨🇴"},
  "Buenos Aires": {code: "AR", name: t('countries.argentina', '阿根廷'), emoji: "🇦🇷"}
}); 