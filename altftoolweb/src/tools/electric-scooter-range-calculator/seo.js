const seo = {
  intro:
    "Real e-scooter range is battery energy divided by watt-hours per kilometre, and this calculator derives that consumption from physics rather than a single averaged number. It applies the standard road-load equation — rolling resistance (Crr × m × g × cos θ), aerodynamic drag (½ × ρ × CdA × v²) and gradient force (m × g × sin θ) — then adds the kinetic energy of ½ m v² thrown away at each stop, minus whatever regenerative braking returns, so weight, speed, hills and traffic each move the answer for a reason you can see.",
  useCases: [
    "You commute 30 km each way with a pillion and want to know whether a 3 kWh scooter genuinely makes the round trip.",
    "Your scooter's claimed range is 146 km but you see 70, and you want to know which assumption in the claim is doing the work.",
    "Your pack is three years old at 82% state of health and you want the range you should now plan around.",
  ],
  benefits: [
    ["Each loss shown separately", "Rolling, aerodynamic, gradient and stop-start energy are listed as their own lines, so you can see what to change."],
    ["Weight and pillion counted properly", "Extra mass raises both rolling resistance and the energy needed for every re-acceleration — not just one of them."],
    ["Speed penalised correctly", "Drag rises with the square of speed, so the tool shows why 60 km/h costs far more than 40 km/h rather than assuming it scales linearly."],
  ],
  faqs: [
    [
      "Why is my electric scooter's real range so much lower than the claimed range?",
      "Because claimed figures are measured at a low constant speed with a light rider and few stops. A 3 kWh scooter uses about 15 Wh/km at a steady 25 km/h but around 37 Wh/km at 45 km/h in city traffic — which turns roughly 180 km of claimed range into roughly 74 km of real range on the same battery.",
    ],
    [
      "How much does rider weight affect e-scooter range?",
      "Less than most people expect on flat roads and a lot on hills. Mass drives rolling resistance and re-acceleration energy but not aerodynamic drag, so an extra 70 kg of pillion and luggage on flat city roads cuts range by roughly 15–20%; on a 6% climb the same load can halve it, because gradient force is directly proportional to mass.",
    ],
    [
      "Does riding slower always increase range?",
      "Up to a point, yes — drag falls with the square of speed, so halving your cruising speed cuts aerodynamic losses to a quarter. Very low speeds stop helping because rolling resistance and the controller's own draw do not shrink, and the trip takes longer, which increases total idle consumption.",
    ],
    [
      "How much of the battery can I actually use?",
      "Plan on about 90% of the nameplate figure. The battery management system holds a reserve at the bottom of the pack, and most riders recharge before zero anyway. Multiply that again by state of health: an 85% SoH pack on a 3000 Wh nameplate gives about 2,295 usable watt-hours.",
    ],
  ],
};

export default seo;
