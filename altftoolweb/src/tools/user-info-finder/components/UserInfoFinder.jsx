"use client";
import React, { useState } from "react";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Cake,
  User2,
  RefreshCcw,
} from "lucide-react";

export default function UserFinder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateMockUser = (searchQuery) => {
    const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Casey"];
    const lastNames = ["Patel", "Kim", "Johnson", "Brown", "Silva"];
    const cities = ["San Francisco", "Boston", "Seattle", "Austin"];

    let firstName, lastName;

    if (searchQuery.includes(" ")) {
      const parts = searchQuery.split(" ");
      firstName = parts[0];
      lastName =
        parts[1] || lastNames[Math.floor(Math.random() * lastNames.length)];
    } else if (!searchQuery.includes("@")) {
      firstName = searchQuery;
      lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    } else {
      firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    }

    return {
      name: `${firstName} ${lastName}`,
      username: `${firstName.toLowerCase()}${Math.floor(Math.random() * 900)}`,
      email: searchQuery.includes("@")
        ? searchQuery
        : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+1 ${Math.floor(Math.random() * 900)}-${Math.floor(
        Math.random() * 900,
      )}-${Math.floor(Math.random() * 9000)}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      age: Math.floor(Math.random() * 40) + 20,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      joined: 2015 + Math.floor(Math.random() * 9),
    };
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return alert("Enter name or email");

    setLoading(true);
    await new Promise((res) => setTimeout(res, 800));

    setUserData(generateMockUser(searchTerm));
    setLoading(false);
  };

  return (
    <div className="pt-4 bg-(--background)">
      <div className="max-w-xl mx-auto">
        {/* HEADER */}

        {/* <h1 className="text-center text-4xl sm:text-5xl font-bold text-(--foreground) mb-2">
          Find Users
        </h1>
        <p className="text-center text-(--muted-foreground) mb-6">
          Search by name or email
        </p> */}

        {/* SEARCH INPUT */}
        <div className="space-y-3 mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-(--muted-foreground)" />

            <input
              value={searchTerm}
              placeholder="Enter name or email..."
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="
                w-full rounded-2xl px-12 py-3.5 
                bg-(--card) border border-(--border)
                text-(--foreground)
                placeholder:text-(--muted-foreground)
                focus:outline-none focus:ring-2 focus:ring-(--primary)
              "
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="
              w-full rounded-2xl py-3.5 font-semibold 
              bg-(--primary) text-(--primary-foreground)
              hover:opacity-90 transition disabled:opacity-50
              flex items-center justify-center gap-2 cursor-pointer
            "
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-(--primary-foreground) border-t-transparent rounded-full"></span>
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? "Searching..." : "Search User"}
          </button>
        </div>

        {/* NO USER */}
        {!userData && !loading && (
          <div
            className="
            p-12 text-center rounded-3xl 
            bg-(--card) border border-(--border) shadow-lg
          "
          >
            <User2 className="w-24 h-24 mx-auto text-(--muted-foreground)" />
            <h3 className="text-xl font-semibold text-(--foreground) mt-3">
              No user found
            </h3>
            <p className="text-(--muted-foreground)">
              Enter a name or email to search
            </p>
          </div>
        )}

        {/* USER CARD */}
        {userData && (
          <div className="rounded-3xl shadow-xl border border-(--border) overflow-hidden bg-(--card)">
            {/* TOP BANNER */}
            <div className="h-28 bg-linear-to-br from-(--primary) to-(--muted)" />

            {/* CONTENT */}
            <div className="p-6 -mt-12.5">
              {/* AVATAR */}
              <div className="flex justify-center mb-4">
                <img
                  src={userData.avatar}
                  className="
                    w-32 h-32 rounded-full border-4 border-(--card) shadow-xl
                  "
                />
              </div>

              {/* NAME */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-(--foreground)">
                  {userData.name}
                </h2>
                <p className="text-(--muted-foreground)">
                  @{userData.username}
                </p>
              </div>

              {/* INFO ITEMS */}
              <div className="space-y-4">
                <InfoItem
                  icon={<Mail />}
                  label="Email"
                  value={userData.email}
                />
                <InfoItem
                  icon={<Phone />}
                  label="Phone"
                  value={userData.phone}
                />
                <InfoItem
                  icon={<MapPin />}
                  label="Location"
                  value={userData.city}
                />
                <InfoItem
                  icon={<Cake />}
                  label="Age"
                  value={`${userData.age} years`}
                />
              </div>

              {/* MEMBER SINCE */}
              <div className="text-center mt-6">
                <span
                  className="
                  inline-block px-4 py-2 rounded-xl 
                  bg-(--muted) border border-(--border)
                  text-(--foreground) font-medium
                "
                >
                  Member since {userData.joined}
                </span>
              </div>

              <button
                onClick={handleSearch}
                className="
                  w-full mt-6 py-3 rounded-xl font-semibold
                  border-2 border-(--border) text-(--foreground)
                  hover:bg-(--muted) transition flex items-center justify-center gap-2
                "
              >
                <RefreshCcw className="w-5 h-5" />
                Search Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------- INFO ITEM COMPONENT -------- */

function InfoItem({ icon, label, value }) {
  return (
    <div
      className="
        flex items-center gap-3 p-4 rounded-xl
        bg-(--muted) border border-(--border)
        hover:bg-(--muted)/70 transition
      "
    >
      <div className="w-7 h-7 text-(--foreground)">{icon}</div>

      <div className="flex-1">
        <div className="text-(--muted-foreground) text-xs uppercase font-semibold">
          {label}
        </div>
        <div className="text-(--foreground) text-base font-bold">{value}</div>
      </div>
    </div>
  );
}
