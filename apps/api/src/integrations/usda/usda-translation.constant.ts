
export const NUTRIENT_MAP: Record<number, string> = {
  // Macros
  1003: '蛋白质',
  1004: '脂肪',
  1005: '碳水化合物',
  1008: '能量 (kcal)',
  2047: '能量 (kJ)',
  1079: '纤维',
  2000: '总糖',
  1051: '水',
  1057: '咖啡因',

  // Minerals
  1087: '钙',
  1089: '铁',
  1090: '镁',
  1091: '磷',
  1092: '钾',
  1093: '钠',
  1095: '锌',
  1098: '铜',
  1099: '氟',
  1101: '锰',
  1103: '硒',

  // Vitamins
  1162: '维生素 C',
  1165: '硫胺素 (B1)',
  1166: '核黄素 (B2)',
  1167: '烟酸 (B3)',
  1170: '泛酸 (B5)',
  1175: '维生素 B6',
  1177: '叶酸 (B9)',
  1178: '维生素 B12',
  1106: '维生素 A',
  1109: '维生素 E',
  1110: '维生素 D (D2 + D3)',
  1114: '维生素 D',
  1185: '维生素 K (叶绿醌)',

  // Fats
  1258: '饱和脂肪酸',
  1292: '单不饱和脂肪酸',
  1293: '多不饱和脂肪酸',
  1257: '反式脂肪酸',
  1253: '胆固醇'
};

export const COMMON_FOOD_TERMS: Record<string, string> = {
  'Butter, salted': '黄油 (咸)',
  'Butter, without salt': '黄油 (无盐)',
  'Cheese, cheddar': '切达芝士',
  'Cheese, mozzarella': '马苏里拉芝士',
  'Egg, whole, raw, fresh': '鸡蛋 (生)',
  'Egg, white, raw, fresh': '蛋清 (生)',
  'Egg, yolk, raw, fresh': '蛋黄 (生)',
  'Milk, whole': '全脂牛奶',
  'Milk, lowfat': '低脂牛奶',
  'Yogurt, plain': '酸奶 (原味)',
  'Flour, wheat': '小麦粉',
  'Rice, white': '白米',
  'Potatoes': '土豆',
  'Tomatoes': '番茄',
  'Chicken, broiler or fryers, breast': '鸡胸肉',
  'Beef, ground': '牛肉未 (碎肉)',
  'Pork, fresh': '猪肉',
  'Salt, table': '食盐',
  'Sugar, white': '白砂糖',
  'Honey': '蜂蜜',
  'Oil, olive': '橄榄油',
  'Oil, soybean': '大豆油',
  'Water, tap': '自来水',
  'Water, bottled': '瓶装水'
};

export function translateFoodName(englishName: string): string {
    // 1. Direct Match
    if (COMMON_FOOD_TERMS[englishName]) {
        return COMMON_FOOD_TERMS[englishName];
    }
    
    // 2. Simple Partial Replacements (Naive)
    let translated = englishName;
    const replacements: [RegExp, string][] = [
        [/, raw/gi, ' (生)'],
        [/, fresh/gi, ' (新鲜)'],
        [/, cooked/gi, ' (熟)'],
        [/, boiled/gi, ' (水煮)'],
        [/, roasted/gi, ' (烤)'],
        [/, salted/gi, ' (咸)'],
        [/, unsalted/gi, ' (无盐)'],
        [/, dry/gi, ' (干)'],
        [/, solids/gi, ' (固体)'],
        [/, liquid/gi, ' (液体)'],
        [/w\/o/gi, '无'],
        [/with/gi, '含'],
        [/skin/gi, '皮'],
        [/bone/gi, '骨'],
        [/meat/gi, '肉'],
        [/fat/gi, '脂'],
        [/lean/gi, '瘦肉'],
    ];

    for (const [pattern, replacement] of replacements) {
        translated = translated.replace(pattern, replacement);
    }
    
    // If no changes were made, or just trivial suffix changes, maybe prepend a marker?
    // For now, leave it alone if we assume user knows some English or we rely on partials.
    
    return translated;
}
