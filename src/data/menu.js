export const CATEGORIES = ['All', 'Appetizers', 'Mains', 'Drinks', 'Desserts'];

export const MENU_ITEMS = [
  // ── Appetizers ──────────────────────────────────────────────────────────
  {
    id: 1, category: 'Appetizers', emoji: '🥢', price: 6.99,
    name:    'Spring Rolls',
    description: 'Crispy rolls with fresh vegetables and dipping sauce',
    nameTH:  'ปอเปี๊ยะทอด',
    descTH:  'แป้งห่อผักสดกรอบนอกนุ่มใน พร้อมน้ำจิ้ม',
  },
  {
    id: 2, category: 'Appetizers', emoji: '🍗', price: 9.99,
    name:    'Buffalo Wings',
    description: 'Spicy buffalo sauce with blue cheese dip',
    nameTH:  'ปีกไก่บัฟฟาโล่',
    descTH:  'ซอสบัฟฟาโล่เผ็ดร้อน พร้อมซอสบลูชีส',
  },
  {
    id: 3, category: 'Appetizers', emoji: '🥗', price: 7.99,
    name:    'Garden Salad',
    description: 'Mixed greens, cherry tomatoes, balsamic vinaigrette',
    nameTH:  'สลัดผักสด',
    descTH:  'ผักรวม มะเขือเทศเชอร์รี่ น้ำสลัดบัลซามิก',
  },
  {
    id: 4, category: 'Appetizers', emoji: '🥖', price: 4.99,
    name:    'Garlic Bread',
    description: 'Toasted ciabatta with garlic herb butter',
    nameTH:  'ขนมปังกระเทียม',
    descTH:  'ขนมปังอบกรอบ เนยกระเทียมสมุนไพร',
  },
  // ── Mains ────────────────────────────────────────────────────────────────
  {
    id: 5, category: 'Mains', emoji: '🍔', price: 13.99,
    name:    'Classic Burger',
    description: 'Beef patty, cheddar, lettuce, pickles, special sauce',
    nameTH:  'เบอร์เกอร์คลาสสิก',
    descTH:  'เนื้อวัว ชีสเชดดาร์ ผักกาด แตงดอง ซอสพิเศษ',
  },
  {
    id: 6, category: 'Mains', emoji: '🍕', price: 14.99,
    name:    'Margherita Pizza',
    description: 'Fresh mozzarella, basil, San Marzano tomatoes',
    nameTH:  'พิซซ่ามาร์เกอร์ริต้า',
    descTH:  'มอซซาเรลล่าสด โหระพา ซอสมะเขือเทศซานมาร์ซาโน',
  },
  {
    id: 7, category: 'Mains', emoji: '🐟', price: 19.99,
    name:    'Grilled Salmon',
    description: 'Atlantic salmon, lemon herb butter, seasonal vegetables',
    nameTH:  'แซลมอนย่าง',
    descTH:  'แซลมอนแอตแลนติก เนยเลมอนสมุนไพร ผักตามฤดูกาล',
  },
  {
    id: 8, category: 'Mains', emoji: '🍝', price: 12.99,
    name:    'Pasta Carbonara',
    description: 'Spaghetti, pancetta, egg yolk, parmesan',
    nameTH:  'พาสต้าคาร์โบนาร่า',
    descTH:  'สปาเกตตี แพนเชตต้า ไข่แดง พาร์เมซาน',
  },
  {
    id: 9, category: 'Mains', emoji: '🍜', price: 13.99,
    name:    'Pad Thai',
    description: 'Rice noodles, shrimp, bean sprouts, crushed peanuts',
    nameTH:  'ผัดไทย',
    descTH:  'เส้นผัดไทยกุ้ง ถั่วงอก ถั่วลิสงบด มะนาว',
  },
  {
    id: 10, category: 'Mains', emoji: '🥩', price: 22.99,
    name:    'BBQ Ribs',
    description: 'Slow-smoked pork ribs with tangy BBQ sauce',
    nameTH:  'ซี่โครงหมูบาร์บีคิว',
    descTH:  'หมูรมควันช้าๆ ซอสบาร์บีคิวรสเปรี้ยวหวาน',
  },
  // ── Drinks ───────────────────────────────────────────────────────────────
  {
    id: 11, category: 'Drinks', emoji: '🥤', price: 2.99,
    name:    'Soft Drink',
    description: 'Coke, Sprite, Fanta, or Diet Coke',
    nameTH:  'น้ำอัดลม',
    descTH:  'โค้ก สไปรต์ แฟนต้า หรือไดเอทโค้ก',
  },
  {
    id: 12, category: 'Drinks', emoji: '🍊', price: 4.99,
    name:    'Fresh Juice',
    description: 'Orange, mango, or passion fruit',
    nameTH:  'น้ำผลไม้สด',
    descTH:  'ส้ม มะม่วง หรือเสาวรส',
  },
  {
    id: 13, category: 'Drinks', emoji: '☕', price: 4.49,
    name:    'Iced Coffee',
    description: 'Cold brew with milk and caramel syrup',
    nameTH:  'กาแฟเย็น',
    descTH:  'โคลด์บรูว์ นม น้ำเชื่อมคาราเมล',
  },
  {
    id: 14, category: 'Drinks', emoji: '💧', price: 3.49,
    name:    'Sparkling Water',
    description: 'San Pellegrino 500ml',
    nameTH:  'น้ำแร่อัดลม',
    descTH:  'ซาน เปลเลกริโน 500ml',
  },
  // ── Desserts ─────────────────────────────────────────────────────────────
  {
    id: 15, category: 'Desserts', emoji: '🍫', price: 8.99,
    name:    'Chocolate Lava Cake',
    description: 'Warm chocolate cake with vanilla ice cream',
    nameTH:  'ช็อกโกแลตลาวาเค้ก',
    descTH:  'เค้กช็อกโกแลตอุ่น คู่ไอศกรีมวานิลลา',
  },
  {
    id: 16, category: 'Desserts', emoji: '🍰', price: 7.99,
    name:    'Tiramisu',
    description: 'Classic Italian with mascarpone and espresso',
    nameTH:  'ทิรามิสุ',
    descTH:  'ทิรามิสุอิตาเลียนคลาสสิก มาสคาร์โปเน่ เอสเปรสโซ',
  },
  {
    id: 17, category: 'Desserts', emoji: '🍧', price: 5.99,
    name:    'Mango Sorbet',
    description: 'Three scoops of tropical mango sorbet',
    nameTH:  'ซอร์เบมะม่วง',
    descTH:  'ซอร์เบมะม่วงสามสกู๊ป รสหวานสดชื่น',
  },
];
