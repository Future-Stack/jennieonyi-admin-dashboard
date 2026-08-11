import { Performer } from "@/components/admin/analytics/TopPerformersTable";

export const statCardsData = [
  {
    title: "Total Revenue",
    value: "$488,500",
    change: "+12.4% vs last month",
    isError: false,
    positive: true
  },
  {
    title: "Vendor Sales",
    value: "$32,500",
    change: "+8.2% vs last month",
    isError: false,
    positive: true
  },
  {
    title: "Service Revenue",
    value: "$643,500",
    change: "+14.1% vs last month",
    isError: false,
    positive: true
  },
  {
    title: "Total Bookings",
    value: "1070",
    change: "+9.5% vs last month",
    isError: false,
    positive: true
  },
  {
    title: "Product Orders",
    value: "5470",
    change: "+9.5% vs last month",
    isError: false,
    positive: true
  },
]

export const revenueData = [
  { name: "Jan", value: 16000 },
  { name: "Feb", value: 12800 },
  { name: "Mar", value: 19200 },
  { name: "Apr", value: 16000 },
  { name: "May", value: 12800 },
  { name: "Jun", value: 14400 },
  { name: "Jul", value: 16000 },
  { name: "Aug", value: 17600 },
  { name: "Sep", value: 20800 },
  { name: "Oct", value: 19200 },
  { name: "Nov", value: 24000 },
  { name: "Dec", value: 22400 },
];
export const vendorSalesData = [
  { name: "Jan", value: 22000 },
  { name: "Feb", value: 3800 },
  { name: "Mar", value: 19200 },
  { name: "Apr", value: 16000 },
  { name: "May", value: 12800 },
  { name: "Jun", value: 14400 },
  { name: "Jul", value: 16000 },
  { name: "Aug", value: 17600 },
  { name: "Sep", value: 20800 },
  { name: "Oct", value: 19200 },
  { name: "Nov", value: 24000 },
  { name: "Dec", value: 13400 },
];
export const bookingData = [
  { name: "Jan", value: 16000 },
  { name: "Feb", value: 12800 },
  { name: "Mar", value: 19200 },
  { name: "Apr", value: 16000 },
  { name: "May", value: 12800 },
  { name: "Jun", value: 11100 },
  { name: "Jul", value: 16000 },
  { name: "Aug", value: 17600 },
  { name: "Sep", value: 20800 },
  { name: "Oct", value: 19200 },
  { name: "Nov", value: 24000 },
  { name: "Dec", value: 30400 },
];
export const commissionData = [
  { name: "Jan", value: 26000 },
  { name: "Feb", value: 12800 },
  { name: "Mar", value: 19200 },
  { name: "Apr", value: 16000 },
  { name: "May", value: 12800 },
  { name: "Jun", value: 14400 },
  { name: "Jul", value: 11000 },
  { name: "Aug", value: 17600 },
  { name: "Sep", value: 20800 },
  { name: "Oct", value: 19200 },
  { name: "Nov", value: 24000 },
  { name: "Dec", value: 50400 },
];

export const revenueBookingData = [
  { day: "Mon", dark: 66, orange: 22 },
  { day: "Tue", dark: 121, orange: 33 },
  { day: "Wed", dark: 99, orange: 26 },
  { day: "Thu", dark: 143, orange: 44 },
  { day: "Fri", dark: 110, orange: 33 },
  { day: "Sat", dark: 176, orange: 55 },
  { day: "Sun", dark: 154, orange: 48 },
];
export const commissionBookingData = [
  { day: "Mon", dark: 11, orange: 55 },
  { day: "Tue", dark: 121, orange: 33 },
  { day: "Wed", dark: 22, orange: 26 },
  { day: "Thu", dark: 143, orange: 66 },
  { day: "Fri", dark: 110, orange: 33 },
  { day: "Sat", dark: 176, orange: 55 },
  { day: "Sun", dark: 34, orange: 48 },
];
export const vendorSalesBookingData = [
  { day: "Mon", dark: 66, orange: 22 },
  { day: "Tue", dark: 121, orange: 33 },
  { day: "Wed", dark: 99, orange: 26 },
  { day: "Thu", dark: 87, orange: 44 },
  { day: "Fri", dark: 110, orange: 33 },
  { day: "Sat", dark: 54, orange: 55 },
  { day: "Sun", dark: 154, orange: 23 },
];
export const productBookingData = [
  { day: "Mon", dark: 122, orange: 56 },
  { day: "Tue", dark: 121, orange: 33 },
  { day: "Wed", dark: 99, orange: 26 },
  { day: "Thu", dark: 21, orange: 44 },
  { day: "Fri", dark: 44, orange: 33 },
  { day: "Sat", dark: 176, orange: 55 },
  { day: "Sun", dark: 134, orange: 88 },
];



export const dummyPerformers: Performer[] = [
  {
    id: "1",
    name: "Yewande Bello",
    initials: "YB",
    category: "Knotless Braids",
    revenue: "$14,200",
    rating: 4.9,
    status: "Verified",
    type: "stylist",
    avatarBg: "bg-[#7A2871]",
  },
  {
    id: "2",
    name: "Kezia Okafor",
    initials: "KO",
    category: "Braiding & Locs",
    revenue: "$12,450",
    rating: 4.9,
    status: "Verified",
    type: "stylist",
    avatarBg: "bg-[#7A2871]",
  },
  {
    id: "3",
    name: "Amina Diallo",
    initials: "AD",
    category: "Natural Hair Care",
    revenue: "$9,820",
    rating: 4.8,
    status: "Verified",
    type: "stylist",
    avatarBg: "bg-[#7A2871]",
  },
  {
    id: "4",
    name: "BraidQueen Supply",
    initials: "BS",
    category: "Braiding Hair",
    revenue: "$11,840",
    rating: 4.8,
    status: "Approved",
    type: "vendor",
    avatarBg: "bg-[#D95F32]",
  },
  {
    id: "5",
    name: "Afro Queen Cosmetics",
    initials: "AQ",
    category: "Hair Extensions",
    revenue: "$8,450",
    rating: 4.7,
    status: "Approved",
    type: "vendor",
    avatarBg: "bg-[#D95F32]",
  },
];

export const dummyPerformers2: Performer[] = [
    {
    id: "3",
    name: "Amina Diallo",
    initials: "AD",
    category: "Natural Hair Care",
    revenue: "$9,820",
    rating: 4.8,
    status: "Verified",
    type: "stylist",
    avatarBg: "bg-[#7A2871]",
  },
  {
    id: "2",
    name: "Kezia Okafor",
    initials: "KO",
    category: "Braiding & Locs",
    revenue: "$12,450",
    rating: 4.9,
    status: "Verified",
    type: "stylist",
    avatarBg: "bg-[#7A2871]",
  },
  {
    id: "4",
    name: "BraidQueen Supply",
    initials: "BS",
    category: "Braiding Hair",
    revenue: "$11,840",
    rating: 4.8,
    status: "Approved",
    type: "vendor",
    avatarBg: "bg-[#D95F32]",
  },
  {
    id: "5",
    name: "Afro Queen Cosmetics",
    initials: "AQ",
    category: "Hair Extensions",
    revenue: "$8,450",
    rating: 4.7,
    status: "Approved",
    type: "vendor",
    avatarBg: "bg-[#D95F32]",
  },
  {
    id: "1",
    name: "Yewande Bello",
    initials: "YB",
    category: "Knotless Braids",
    revenue: "$14,200",
    rating: 4.9,
    status: "Verified",
    type: "stylist",
    avatarBg: "bg-[#7A2871]",
  },
];