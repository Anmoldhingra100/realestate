export type Property = {
  id: string; slug: string; title: string; type: 'Apartment'|'Villa'|'Penthouse'|'Plot'|'Office'|'House';
  status: 'For Sale'|'For Rent'|'New Launch';
  price: number; pricePer?: string; city: string; locality: string;
  beds: number; baths: number; area: number; areaUnit: 'sqft';
  images: string[]; tags: string[]; featured?: boolean; verified?: boolean;
  agent: { name: string; phone: string; avatar: string };
  amenities: string[]; description: string; yearBuilt: number; parking: number;
  lat: number; lng: number;
};
const img = (id:string,w=1200)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const A = { name:'Aarav Mehta', phone:'+91 98101 22334', avatar:img('photo-1507003211169-0a1dd7228f2d',200) };
const B = { name:'Priya Sharma', phone:'+91 99100 88221', avatar:img('photo-1494790108377-be9c29b29330',200) };
const C = { name:'Rohan Verma', phone:'+91 98882 11220', avatar:img('photo-1500648767791-00dcc994a43e',200) };

export const PROPERTIES: Property[] = [
  { id:'p1', slug:'skyline-penthouse-bandra', title:'Skyline Penthouse with Sea View', type:'Penthouse', status:'For Sale', price:78500000, city:'Mumbai', locality:'Bandra West', beds:4, baths:5, area:4200, areaUnit:'sqft', featured:true, verified:true,
    images:['photo-1600585154340-be6161a56a0c','photo-1600596542815-ffad4c1539a9','photo-1600566753190-17f0baa2a6c3','photo-1600607687939-ce8a6c25118c'].map(i=>img(i)),
    tags:['Sea View','Private Pool','Smart Home'], agent:A,
    amenities:['Infinity Pool','Private Gym','Concierge','Valet Parking','EV Charging','24/7 Security','Sky Lounge','Wine Cellar'],
    description:'A masterfully designed penthouse with panoramic sea views, double-height living room, and a private rooftop infinity pool.',
    yearBuilt:2023, parking:3, lat:19.06, lng:72.83 },
  { id:'p2', slug:'glasshouse-villa-whitefield', title:'Glasshouse Villa in Gated Estate', type:'Villa', status:'For Sale', price:42000000, city:'Bengaluru', locality:'Whitefield', beds:5, baths:6, area:5600, areaUnit:'sqft', featured:true, verified:true,
    images:['photo-1613490493576-7fde63acd811','photo-1568605114967-8130f3a36994','photo-1600210492486-724fe5c67fb0','photo-1600585152220-90363fe7e115'].map(i=>img(i)),
    tags:['Gated Community','Private Lawn'], agent:B,
    amenities:['Private Pool','Home Theatre','Servant Quarters','Garden','Solar Power','Club House','Tennis Court'],
    description:'Architect-designed villa with floor-to-ceiling glass, double-height living, and a manicured private lawn inside a premium gated estate.',
    yearBuilt:2022, parking:4, lat:12.97, lng:77.74 },
  { id:'p3', slug:'2bhk-apartment-koregaon-park', title:'Modern 2BHK in the Heart of Koregaon Park', type:'Apartment', status:'For Rent', price:65000, pricePer:'/month', city:'Pune', locality:'Koregaon Park', beds:2, baths:2, area:1180, areaUnit:'sqft', verified:true,
    images:['photo-1502672260266-1c1ef2d93688','photo-1505691938895-1758d7feb511','photo-1493809842364-78817add7ffb','photo-1501183638710-841dd1904471'].map(i=>img(i)),
    tags:['Furnished','Pet Friendly'], agent:C,
    amenities:['Gym','Pool','Power Backup','Lift','Reserved Parking','Security'],
    description:'Fully furnished 2BHK with designer interiors, modular kitchen, and a leafy balcony, walking distance to cafés and boutiques.',
    yearBuilt:2020, parking:1, lat:18.54, lng:73.89 },
  { id:'p4', slug:'4bhk-builder-floor-greater-kailash', title:'Independent 4BHK Builder Floor', type:'House', status:'For Sale', price:58500000, city:'Delhi', locality:'Greater Kailash II', beds:4, baths:4, area:2800, areaUnit:'sqft', verified:true,
    images:['photo-1564013799919-ab600027ffc6','photo-1600585154526-990dced4db0d','photo-1600585154363-67eb9e2e2099','photo-1505691938895-1758d7feb511'].map(i=>img(i)),
    tags:['Lift','Stilt Parking'], agent:A,
    amenities:['Lift','Modular Kitchen','Servant Room','Power Backup','Park Facing'],
    description:'Brand new park-facing builder floor with premium fittings, Italian marble flooring and private terrace.',
    yearBuilt:2024, parking:2, lat:28.54, lng:77.24 },
  { id:'p5', slug:'sea-facing-3bhk-worli', title:'Sea Facing 3BHK at Worli Sea Face', type:'Apartment', status:'For Sale', price:115000000, city:'Mumbai', locality:'Worli', beds:3, baths:4, area:2400, areaUnit:'sqft', featured:true, verified:true,
    images:['photo-1502005229762-cf1b2da7c5d6','photo-1512917774080-9991f1c4c750','photo-1600566753086-00f18fb6b3ea','photo-1600210491892-03d54c0aaf87'].map(i=>img(i)),
    tags:['Sea View','High Floor','Premium'], agent:B,
    amenities:['Concierge','Spa','Pool','Sky Deck','Valet','Wine Cellar'],
    description:'Coveted sea-facing residence on a high floor with uninterrupted Arabian Sea views and resort-style amenities.',
    yearBuilt:2021, parking:2, lat:19.01, lng:72.81 },
  { id:'p6', slug:'office-space-cyber-city', title:'Grade-A Office Space in DLF Cyber City', type:'Office', status:'For Rent', price:285000, pricePer:'/month', city:'Gurugram', locality:'DLF Cyber City', beds:0, baths:4, area:3500, areaUnit:'sqft',
    images:['photo-1497366216548-37526070297c','photo-1568992687947-868a62a9f521','photo-1497366811353-6870744d04b2','photo-1556761175-5973dc0f32e7'].map(i=>img(i)),
    tags:['Plug & Play','LEED Gold'], agent:C,
    amenities:['Reception','Cabins','Pantry','Conference Rooms','24/7 Access'],
    description:'Fully fitted Grade-A office in a LEED Gold tower with 50 workstations, four cabins and stunning skyline views.',
    yearBuilt:2019, parking:8, lat:28.49, lng:77.09 },
  { id:'p7', slug:'riverfront-plot-alibaug', title:'Riverfront Plot in Alibaug', type:'Plot', status:'For Sale', price:24500000, city:'Alibaug', locality:'Awas', beds:0, baths:0, area:11000, areaUnit:'sqft',
    images:['photo-1500382017468-9049fed747ef','photo-1501785888041-af3ef285b470','photo-1470770841072-f978cf4d019e','photo-1444703686981-a3abbc4d4fe3'].map(i=>img(i)),
    tags:['NA Plot','Clear Title'], agent:A,
    amenities:['Riverfront','Compound Wall','Borewell','Approach Road'],
    description:'NA-sanctioned, clear-title riverfront plot with mature trees, ideal for a private weekend villa.',
    yearBuilt:0, parking:0, lat:18.64, lng:72.87 },
  { id:'p8', slug:'3bhk-new-launch-thane', title:'New Launch 3BHK Sky Residences', type:'Apartment', status:'New Launch', price:21500000, city:'Thane', locality:'Ghodbunder Road', beds:3, baths:3, area:1450, areaUnit:'sqft', featured:true,
    images:['photo-1600585154340-be6161a56a0c','photo-1600607687644-c7171b42498f','photo-1600566752355-35792bedcfea','photo-1600585153490-76fb20a32601'].map(i=>img(i)),
    tags:['New Launch','RERA','0% GST'], agent:B,
    amenities:['Clubhouse','Pool','Kids Play','Gym','Co-working','Library','Garden'],
    description:'Pre-launch pricing on smartly designed 3BHK homes with 30+ premium amenities and lake views.',
    yearBuilt:2027, parking:1, lat:19.25, lng:72.97 },
  { id:'p9', slug:'duplex-villa-ecr-chennai', title:'Designer Duplex Villa on ECR', type:'Villa', status:'For Sale', price:36500000, city:'Chennai', locality:'ECR', beds:4, baths:5, area:3800, areaUnit:'sqft', verified:true,
    images:['photo-1572120360610-d971b9d7767c','photo-1600585152915-d208bec867a1','photo-1600596542815-ffad4c1539a9','photo-1600210491892-03d54c0aaf87'].map(i=>img(i)),
    tags:['Beach Side','Solar Powered'], agent:C,
    amenities:['Private Pool','Garden','Solar','Servant Quarters','Smart Home'],
    description:'Contemporary duplex on the East Coast Road with a private plunge pool and beach access just 200m away.',
    yearBuilt:2022, parking:2, lat:12.86, lng:80.24 },
];
export const CITIES = ['Mumbai','Bengaluru','Pune','Delhi','Gurugram','Chennai','Alibaug','Thane'];
export const TYPES = ['Apartment','Villa','Penthouse','House','Plot','Office'] as const;
export const formatPrice = (n:number) => {
  if (n>=10000000) return `₹${(n/10000000).toFixed(2)} Cr`;
  if (n>=100000) return `₹${(n/100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};
