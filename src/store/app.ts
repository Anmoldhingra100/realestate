import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type Inquiry = { id:string; propertyId:string; name:string; phone:string; message:string; date:string };
type State = {
  favorites: string[]; toggleFav:(id:string)=>void; isFav:(id:string)=>boolean;
  inquiries: Inquiry[]; addInquiry:(i:Omit<Inquiry,'id'|'date'>)=>void;
};
export const useApp = create<State>()(persist((set,get)=>({
  favorites: [],
  toggleFav: (id)=> set(s=> ({ favorites: s.favorites.includes(id) ? s.favorites.filter(x=>x!==id) : [...s.favorites, id] })),
  isFav: (id)=> get().favorites.includes(id),
  inquiries: [],
  addInquiry: (i)=> set(s=> ({ inquiries: [{ ...i, id: crypto.randomUUID(), date: new Date().toISOString() }, ...s.inquiries] })),
}),{ name:'estatehub' }));
