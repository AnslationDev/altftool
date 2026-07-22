export const CATEGORIES = {
  CLOTHING: "clothing",
  SHOES: "shoes"
};

export const GENDERS = {
  MEN: "men",
  WOMEN: "women",
  KIDS: "kids"
};

export const FIT_TYPES = {
  SLIM: { label: "Slim Fit", offset: -2 },
  REGULAR: { label: "Regular Fit", offset: 0 },
  LOOSE: { label: "Loose Fit", offset: 2 },
  OVERSIZED: { label: "Oversized", offset: 4 }
};

export const SIZE_DATA = {
  shoes: {
    men: [
      { us: "7", uk: "6.5", eu: "40", in: "6", cm: "25" },
      { us: "7.5", uk: "7", eu: "40.5", in: "6.5", cm: "25.5" },
      { us: "8", uk: "7.5", eu: "41", in: "7", cm: "26" },
      { us: "8.5", uk: "8", eu: "42", in: "7.5", cm: "26.5" },
      { us: "9", uk: "8.5", eu: "42.5", in: "8", cm: "27" },
      { us: "9.5", uk: "9", eu: "43", in: "8.5", cm: "27.5" },
      { us: "10", uk: "9.5", eu: "44", in: "9", cm: "28" },
      { us: "10.5", uk: "10", eu: "44.5", in: "9.5", cm: "28.5" },
      { us: "11", uk: "10.5", eu: "45", in: "10", cm: "29" },
      { us: "11.5", uk: "11", eu: "45.5", in: "10.5", cm: "29.5" },
      { us: "12", uk: "11.5", eu: "46", in: "11", cm: "30" },
    ],
    women: [
      { us: "5", uk: "3", eu: "35", in: "3", cm: "22" },
      { us: "5.5", uk: "3.5", eu: "36", in: "3.5", cm: "22.5" },
      { us: "6", uk: "4", eu: "36.5", in: "4", cm: "23" },
      { us: "6.5", uk: "4.5", eu: "37.5", in: "4.5", cm: "23.5" },
      { us: "7", uk: "5", eu: "38", in: "5", cm: "24" },
      { us: "7.5", uk: "5.5", eu: "38.5", in: "5.5", cm: "24.5" },
      { us: "8", uk: "6", eu: "39", in: "6", cm: "25" },
      { us: "8.5", uk: "6.5", eu: "40", in: "6.5", cm: "25.5" },
      { us: "9", uk: "7", eu: "40.5", in: "7", cm: "26" },
      { us: "9.5", uk: "7.5", eu: "41", in: "7.5", cm: "26.5" },
      { us: "10", uk: "8", eu: "42", in: "8", cm: "27" },
    ],
    kids: [
      { us: "10C", uk: "9.5", eu: "27", in: "9", cm: "16.5" },
      { us: "11C", uk: "10.5", eu: "28", in: "10", cm: "17.5" },
      { us: "12C", uk: "11.5", eu: "30", in: "11", cm: "18.5" },
      { us: "13C", uk: "12.5", eu: "31", in: "12", cm: "19.5" },
      { us: "1Y", uk: "13.5", eu: "32", in: "13", cm: "20.5" },
      { us: "2Y", uk: "1.5", eu: "33.5", in: "1", cm: "21.5" },
      { us: "3Y", uk: "2.5", eu: "35", in: "2", cm: "22.5" },
    ]
  },
  clothing: {
    men: {
      shirts: [
        { size: "S", us: "34-36", uk: "34-36", eu: "44-46", chest: "34-36", waist: "28-30" },
        { size: "M", us: "38-40", uk: "38-40", eu: "48-50", chest: "38-40", waist: "32-34" },
        { size: "L", us: "42-44", uk: "42-44", eu: "52-54", chest: "42-44", waist: "36-38" },
        { size: "XL", us: "46-48", uk: "46-48", eu: "56-58", chest: "46-48", waist: "40-42" },
      ],
      t_shirts: [
        { size: "S", us: "34-36", uk: "34-36", eu: "44-46", chest: "34-36", waist: "28-30" },
        { size: "M", us: "38-40", uk: "38-40", eu: "48-50", chest: "38-40", waist: "32-34" },
        { size: "L", us: "42-44", uk: "42-44", eu: "52-54", chest: "42-44", waist: "36-38" },
        { size: "XL", us: "46-48", uk: "46-48", eu: "56-58", chest: "46-48", waist: "40-42" },
      ],
      polos: [
        { size: "S", us: "36", uk: "36", eu: "46", chest: "36" },
        { size: "M", us: "38", uk: "38", eu: "48", chest: "38" },
        { size: "L", us: "40", uk: "40", eu: "50", chest: "40" },
        { size: "XL", us: "42", uk: "42", eu: "52", chest: "42" },
      ],
      hoodies: [
        { size: "S", us: "36", uk: "36", eu: "46", chest: "38" },
        { size: "M", us: "38", uk: "38", eu: "48", chest: "40" },
        { size: "L", us: "40", uk: "40", eu: "50", chest: "42" },
        { size: "XL", us: "42", uk: "42", eu: "52", chest: "44" },
      ],
      jackets: [
        { size: "S", us: "36", uk: "36", eu: "46", chest: "36-38", waist: "30" },
        { size: "M", us: "38", uk: "38", eu: "48", chest: "38-40", waist: "32" },
        { size: "L", us: "40", uk: "40", eu: "50", chest: "40-42", waist: "34" },
        { size: "XL", us: "42", uk: "42", eu: "52", chest: "42-44", waist: "36" },
      ],
      suits: [
        { size: "36R", us: "36", uk: "36", eu: "46", chest: "36", waist: "30" },
        { size: "38R", us: "38", uk: "38", eu: "48", chest: "38", waist: "32" },
        { size: "40R", us: "40", uk: "40", eu: "50", chest: "40", waist: "34" },
        { size: "42R", us: "42", uk: "42", eu: "52", chest: "42", waist: "36" },
      ],
      activewear: [
        { size: "S", us: "28-30", waist: "28-30" },
        { size: "M", us: "32-34", waist: "32-34" },
        { size: "L", us: "36-38", waist: "36-38" },
      ],
      swimwear: [
        { size: "S", us: "30", waist: "30" },
        { size: "M", us: "32", waist: "32" },
        { size: "L", us: "34", waist: "34" },
      ],
      jeans: [
        { size: "28", us: "28", uk: "28", eu: "44", waist: "28", hip: "34" },
        { size: "30", us: "30", uk: "30", eu: "46", waist: "30", hip: "36" },
        { size: "32", us: "32", uk: "32", eu: "48", waist: "32", hip: "38" },
        { size: "34", us: "34", uk: "34", eu: "50", waist: "34", hip: "40" },
        { size: "36", us: "36", uk: "36", eu: "52", waist: "36", hip: "42" },
      ],
      trousers: [
        { size: "28", us: "28", uk: "28", eu: "44", waist: "28", hip: "34" },
        { size: "30", us: "30", uk: "30", eu: "46", waist: "30", hip: "36" },
        { size: "32", us: "32", uk: "32", eu: "48", waist: "32", hip: "38" },
        { size: "34", us: "34", uk: "34", eu: "50", waist: "34", hip: "40" },
      ],
      shorts: [
        { size: "S", us: "28-30", uk: "28-30", eu: "44-46", waist: "28-30" },
        { size: "M", us: "32-34", uk: "32-34", eu: "48-50", waist: "32-34" },
        { size: "L", us: "36-38", uk: "36-38", eu: "52-54", waist: "36-38" },
      ]
    },
    women: {
      tops: [
        { size: "XS", us: "0-2", uk: "4-6", eu: "32-34", chest: "31-32", waist: "24-25" },
        { size: "S", us: "4-6", uk: "8-10", eu: "36-38", chest: "33-35", waist: "26-27" },
        { size: "M", us: "8-10", uk: "12-14", eu: "40-42", chest: "36-38", waist: "28-30" },
        { size: "L", us: "12-14", uk: "16-18", eu: "44-46", chest: "39-41", waist: "31-33" },
        { size: "XL", us: "16-18", uk: "20-22", eu: "48-50", chest: "42-44", waist: "34-37" },
      ],
      dresses: [
        { size: "XS", us: "0-2", uk: "4-6", eu: "32-34", chest: "31-32", waist: "24-25", hip: "34-35" },
        { size: "S", us: "4-6", uk: "8-10", eu: "36-38", chest: "33-35", waist: "26-27", hip: "36-37" },
        { size: "M", us: "8-10", uk: "12-14", eu: "40-42", chest: "36-38", waist: "28-30", hip: "38-40" },
        { size: "L", us: "12-14", uk: "16-18", eu: "44-46", chest: "39-41", waist: "31-33", hip: "41-43" },
        { size: "XL", us: "16-18", uk: "20-22", eu: "48-50", chest: "42-44", waist: "34-37", hip: "44-47" },
      ],
      sweaters: [
        { size: "XS", us: "0-2", eu: "32", chest: "32" },
        { size: "S", us: "4-6", eu: "36", chest: "34" },
        { size: "M", us: "8-10", eu: "40", chest: "36" },
        { size: "L", us: "12-14", eu: "44", chest: "39" },
      ],
      blazers: [
        { size: "XS", us: "0-2", eu: "32", chest: "32", waist: "24" },
        { size: "S", us: "4-6", eu: "36", chest: "34", waist: "26" },
        { size: "M", us: "8-10", eu: "40", chest: "36", waist: "28" },
        { size: "L", us: "12-14", eu: "44", chest: "39", waist: "31" },
      ],
      jeans: [
        { size: "24", us: "0", uk: "4", eu: "32", waist: "24-25", hip: "33-34" },
        { size: "26", us: "2", uk: "6", eu: "34", waist: "26-27", hip: "35-36" },
        { size: "28", us: "4-6", uk: "8-10", eu: "36-38", waist: "28-29", hip: "37-38" },
        { size: "30", us: "8-10", uk: "12-14", eu: "40-42", waist: "30-31", hip: "39-40" },
        { size: "32", us: "12-14", uk: "16-18", eu: "44-46", waist: "32-33", hip: "41-42" },
      ],
      skirts: [
        { size: "XS", us: "0-2", uk: "4-6", eu: "32-34", waist: "24-25", hip: "34-35" },
        { size: "S", us: "4-6", uk: "8-10", eu: "36-38", waist: "26-27", hip: "36-37" },
        { size: "M", us: "8-10", uk: "12-14", eu: "40-42", waist: "28-30", hip: "38-40" },
        { size: "L", us: "12-14", uk: "16-18", eu: "44-46", waist: "31-33", hip: "41-43" },
      ],
      shorts: [
        { size: "XS", us: "0-2", waist: "24-25" },
        { size: "S", us: "4-6", waist: "26-27" },
        { size: "M", us: "8-10", waist: "28-29" },
        { size: "L", us: "12-14", waist: "30-32" },
      ],
      bras: [
        { size: "32A", us: "32A", uk: "32A", eu: "70A", chest: "32", waist: "27" },
        { size: "34B", us: "34B", uk: "34B", eu: "75B", chest: "34", waist: "29" },
        { size: "36C", us: "36C", uk: "36C", eu: "80C", chest: "36", waist: "31" },
        { size: "38D", us: "38D", uk: "38D", eu: "85D", chest: "38", waist: "33" },
      ],
      sleepwear: [
        { size: "S", us: "4-6", waist: "26-27" },
        { size: "M", us: "8-10", waist: "28-30" },
        { size: "L", us: "12-14", waist: "31-33" },
      ],
      activewear: [
        { size: "XS", us: "0-2", waist: "24-25", hip: "34-35" },
        { size: "S", us: "4-6", waist: "26-27", hip: "36-37" },
        { size: "M", us: "8-10", waist: "28-29", hip: "38-39" },
      ]
    },
    kids: {
      t_shirts: [
        { size: "2-3Y", us: "2T-3T", uk: "2-3Y", eu: "92-98", chest: "20-21", waist: "19-20" },
        { size: "4-5Y", us: "4T-5T", uk: "4-5Y", eu: "104-110", chest: "22-23", waist: "21-22" },
        { size: "6-7Y", us: "6-7", uk: "6-7Y", eu: "116-122", chest: "24-25", waist: "23-24" },
        { size: "8-9Y", us: "8-9", uk: "8-9Y", eu: "128-134", chest: "26-27", waist: "25-26" },
      ],
      dresses: [
        { size: "2-3Y", us: "2T-3T", eu: "92-98", chest: "20-21" },
        { size: "4-5Y", us: "4T-5T", eu: "104-110", chest: "22-23" },
        { size: "6-7Y", us: "6-7", eu: "116-122", chest: "24-25" },
      ],
      jackets: [
        { size: "2-3Y", eu: "92-98", chest: "22" },
        { size: "4-5Y", eu: "104-110", chest: "24" },
        { size: "6-7Y", eu: "116-122", chest: "26" },
      ],
      sleepwear: [
        { size: "2-3Y", eu: "92-98", waist: "19-20" },
        { size: "4-5Y", eu: "104-110", waist: "21-22" },
        { size: "6-7Y", eu: "116-122", waist: "23-24" },
      ],
      swimwear: [
        { size: "2-3Y", eu: "92-98", waist: "19-20" },
        { size: "4-5Y", eu: "104-110", waist: "21-22" },
      ],
      bottoms: [
        { size: "2-3Y", us: "2T-3T", uk: "2-3Y", eu: "92-98", waist: "19-20", hip: "21-22" },
        { size: "4-5Y", us: "4T-5T", uk: "4-5Y", eu: "104-110", waist: "21-22", hip: "23-24" },
        { size: "6-7Y", us: "6-7", uk: "6-7Y", eu: "116-122", waist: "23-24", hip: "25-26" },
      ]
    }
  }
};
