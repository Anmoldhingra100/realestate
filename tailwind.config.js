/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { display: ['"Plus Jakarta Sans"','sans-serif'], body: ['Inter','sans-serif'] },
    colors: { brand: { 50:'#f0f7f4',100:'#dbeee5',500:'#0f7a5a',600:'#0b6249',700:'#084b38',900:'#03241b' }, gold:{500:'#c9a14a',600:'#a8862e'} }
  }},
  plugins: [],
};
