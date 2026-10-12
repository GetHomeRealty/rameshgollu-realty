/* =========================================================
   Site config + featured listings.
   Edit AGENT details here — they populate every page.
   Replace LISTINGS with your featured picks.
   ========================================================= */
window.AGENT = {
  name: "Ramesh Gollu",
  title: "REALTOR® / Sales Representative",
  brokerage: "Get Home Realty",
  phone: "+1 (416) 268-5477",
  phoneRaw: "+14162685477",
  whatsapp: "14162685477",
  email: "ramesh@gethomerealty.ca",
  // How many featured listings to show on the homepage (3–6).
  featuredCount: 6
};

const img = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

window.LISTINGS = [
  {
    id: "1", status: "Featured", price: 1849000, beds: 5, baths: 4, sqft: 3650, type: "Detached",
    mode: "buy", city: "Mississauga", address: "128 Lakeview Crescent, Mississauga, ON",
    images: ["photo-1600596542815-ffad4c1539a9", "photo-1600607687939-ce8a6c25118c", "photo-1600566753190-17f0baa2a6c3"],
    description: "A light-filled family home on a quiet crescent with an open-concept chef's kitchen, vaulted family room, primary retreat with spa ensuite, and a landscaped backyard made for entertaining."
  },
  {
    id: "2", status: "New", price: 1299000, beds: 4, baths: 3, sqft: 2780, type: "Detached",
    mode: "buy", city: "Brampton", address: "42 Maple Ridge Drive, Brampton, ON",
    images: ["photo-1600585154340-be6161a56a0c", "photo-1600210492486-724fe5c67fb0", "photo-1560448204-e02f11c3d0e2"],
    description: "Modern detached home with 9-ft ceilings, hardwood throughout, quartz kitchen with walk-in pantry and a finished basement with separate entrance."
  },
  {
    id: "3", status: "Featured", price: 2450000, beds: 5, baths: 5, sqft: 4200, type: "Luxury",
    mode: "buy", city: "Oakville", address: "9 Heritage Way, Oakville, ON",
    images: ["photo-1613490493576-7fde63acd811", "photo-1600566753086-00f18fb6b3ea", "photo-1600573472592-401b489a3cdc"],
    description: "Contemporary luxury residence with floor-to-ceiling glazing, heated pool, home theatre and a three-car garage on a premium ravine lot."
  },
  {
    id: "4", status: "Open House", price: 989000, beds: 3, baths: 3, sqft: 1950, type: "Townhouse",
    mode: "buy", city: "Toronto", address: "17 Garden Row, Toronto, ON",
    images: ["photo-1512917774080-9991f1c4c750", "photo-1505693416388-ac5ce068fe85", "photo-1507089947368-19c1da9775ae"],
    description: "Stylish freehold townhome steps from transit and parks, with a rooftop terrace, upgraded kitchen and attached garage."
  },
  {
    id: "5", status: "For Rent", price: 3600, beds: 3, baths: 2, sqft: 1600, type: "Townhouse",
    mode: "rent", city: "Mississauga", address: "55 Square One Blvd, Mississauga, ON",
    images: ["photo-1570129477492-45c003edd2be", "photo-1502672260266-1c1ef2d93688", "photo-1484154218962-a197022b5858"],
    description: "Bright end-unit townhome for lease, close to shopping and highways. Private yard, in-suite laundry and two parking spaces."
  },
  {
    id: "6", status: "New", price: 1575000, beds: 4, baths: 4, sqft: 3100, type: "Detached",
    mode: "buy", city: "Caledon", address: "6 Country Lane, Caledon, ON",
    images: ["photo-1580587771525-78b9dba3b914", "photo-1600607687644-c7171b42498b", "photo-1600585154526-990dced4db0d"],
    description: "Executive home surrounded by greenery, with a main-floor office, custom millwork, oversized windows and a walk-out lower level."
  }
].map(l => ({ ...l, imageUrls: l.images.map(id => img(id)), thumb: img(l.images[0], 700) }));

window.formatPrice = (l) =>
  "$" + l.price.toLocaleString("en-CA") + (l.mode === "rent" ? "/mo" : "");
