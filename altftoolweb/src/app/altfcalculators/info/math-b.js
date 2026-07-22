const info = {
  "area-calculator": {
    intro: [
      "The Area Calculator finds the two-dimensional space enclosed by a flat shape. Pick a shape — rectangle, square, triangle, circle, trapezoid, parallelogram or ellipse — enter its dimensions and the area is computed instantly using the correct geometric formula.",
      "Area is always expressed in square units. Whatever unit you measure your dimensions in (centimetres, metres, feet), the result is that unit squared — for example metres give square metres.",
    ],
    formula: {
      expression: "Rectangle A = l·w · Triangle A = ½·b·h · Circle A = π·r² · Trapezoid A = ½(a+b)·h · Ellipse A = π·a·b",
      where: [
        ["l, w", "length and width"],
        ["b, h", "base and perpendicular height"],
        ["r", "radius of a circle"],
        ["a, b", "the two parallel sides (trapezoid) or the two semi-axes (ellipse)"],
      ],
      note: "For a square, l = w, so A = s². For a parallelogram, A = base × perpendicular height (not the slanted side length).",
    },
    howToUse: [
      "Select the shape you want to measure.",
      "Enter each required dimension in the same unit.",
      "Read the area and the substituted calculation below.",
      "Switch shapes at any time — your figures stay in the boxes.",
    ],
    goodToKnow: [
      "Height in the triangle, trapezoid and parallelogram formulas is the perpendicular height, not a sloping edge.",
      "For an ellipse, a and b are the semi-axes (half of each full axis); if a = b you get a circle.",
      "All dimensions must be positive numbers — a length of zero has no area.",
    ],
    faqs: [
      { q: "What is the difference between area and perimeter?", a: "Area measures the surface a shape covers (square units); perimeter measures the total length of its boundary (linear units)." },
      { q: "Why does the parallelogram use height and not the slanted side?", a: "Area depends on the perpendicular distance between the two parallel sides. The slanted side is longer and would overstate the area." },
      { q: "Can I mix units, like centimetres and metres?", a: "No. Convert every dimension to the same unit first, otherwise the result is meaningless." },
      { q: "How do I get the area of a shape that isn't listed?", a: "Split it into the basic shapes here, find each area, then add them together (or subtract for holes)." },
    ],
  },

  "volume-calculator": {
    intro: [
      "The Volume Calculator measures the three-dimensional space inside a solid. Choose a shape — cube, box, sphere, cylinder, cone or pyramid — enter its dimensions and the enclosed volume is calculated with the correct formula.",
      "Volume is reported in cubic units. Dimensions entered in centimetres give cubic centimetres; metres give cubic metres, and so on.",
    ],
    formula: {
      expression: "Cube V = s³ · Box V = l·w·h · Sphere V = 4⁄3·π·r³ · Cylinder V = π·r²·h · Cone V = ⅓·π·r²·h · Pyramid V = ⅓·l·w·h",
      where: [
        ["s", "side length of a cube"],
        ["l, w, h", "length, width and height"],
        ["r", "radius"],
        ["h", "perpendicular height for cylinder, cone and pyramid"],
      ],
      note: "A cone holds exactly one-third of the cylinder that shares its radius and height. A pyramid holds one-third of the box on the same base.",
    },
    howToUse: [
      "Select the solid you are measuring.",
      "Enter each dimension in the same unit.",
      "Read the volume and the substituted formula.",
      "Change shape whenever you like without losing your numbers.",
    ],
    goodToKnow: [
      "Radius is half the diameter — measure across the full width and halve it if needed.",
      "Height must be the perpendicular (straight-up) height, not a slant.",
      "1 cubic metre = 1000 litres, so volumes convert easily to capacity.",
    ],
    faqs: [
      { q: "What's the difference between volume and capacity?", a: "Volume is the space a solid occupies; capacity is how much a container can hold. They use the same units and are numerically equal for hollow shapes." },
      { q: "Why is a cone's volume one-third of a cylinder's?", a: "For the same base radius and height, three identical cones fill one cylinder — a result proven by integration." },
      { q: "How do I convert cubic centimetres to litres?", a: "Divide by 1000. One litre equals 1000 cubic centimetres (a 10 cm cube)." },
      { q: "Do I use radius or diameter for a sphere?", a: "Radius. If you measured the diameter, divide it by two before entering it." },
    ],
  },

  "circle-calculator": {
    intro: [
      "The Circle Calculator solves every property of a circle from any single measurement. Enter one of the radius, diameter, circumference or area and it derives the other three instantly.",
      "It works by first recovering the radius from whatever you know, then applying the standard circle formulas. This is handy in geometry, engineering, and any DIY task involving round objects.",
    ],
    formula: {
      expression: "d = 2r · C = 2πr · A = πr²   (r = C⁄2π, r = √(A⁄π))",
      where: [
        ["r", "radius"],
        ["d", "diameter"],
        ["C", "circumference (perimeter)"],
        ["A", "area"],
        ["π", "pi ≈ 3.14159"],
      ],
    },
    howToUse: [
      "Choose which value you already know.",
      "Type that value into the input box.",
      "Read the radius, diameter, circumference and area below.",
      "Switch the known property to solve a different way.",
    ],
    goodToKnow: [
      "The diameter is always exactly twice the radius.",
      "The ratio of circumference to diameter is π for every circle, no matter its size.",
      "Doubling the radius quadruples the area, because area grows with r².",
    ],
    faqs: [
      { q: "What is the circumference of a circle?", a: "It is the distance all the way around the edge, equal to 2πr or π times the diameter." },
      { q: "How do I find the radius from the area?", a: "Divide the area by π and take the square root: r = √(A ÷ π)." },
      { q: "Is circumference the same as perimeter?", a: "Yes. Perimeter is the general term for the boundary length; for a circle it is called the circumference." },
      { q: "Why is π used so often here?", a: "π is the fixed ratio between a circle's circumference and its diameter, so it appears in every circle formula." },
    ],
  },

  "triangle-calculator": {
    intro: [
      "The Triangle Calculator finds the area of a triangle two ways: from a base and its perpendicular height, or from the lengths of all three sides using Heron's formula.",
      "When you enter three sides it also checks the triangle inequality (each side must be shorter than the sum of the other two) and returns the perimeter, so you know whether the triangle can exist at all.",
    ],
    formula: {
      expression: "A = ½·b·h   or   A = √(s(s−a)(s−b)(s−c)),  s = (a+b+c)⁄2",
      where: [
        ["b, h", "base and perpendicular height"],
        ["a, b, c", "the three side lengths"],
        ["s", "semi-perimeter, half the total perimeter"],
      ],
      note: "Heron's formula needs no angle or height — just the three sides.",
    },
    howToUse: [
      "Choose the base & height method or the three-sides method.",
      "Enter the required measurements.",
      "Read the area; the sides method also shows the perimeter.",
      "If three sides can't form a triangle, a warning appears.",
    ],
    goodToKnow: [
      "The height must be perpendicular to the chosen base, not a sloping side.",
      "Any side can be treated as the base as long as you use its matching height.",
      "Three sides form a valid triangle only when the two shorter sides together exceed the longest.",
    ],
    faqs: [
      { q: "What is Heron's formula?", a: "A way to find a triangle's area from its three side lengths alone: A = √(s(s−a)(s−b)(s−c)), where s is the semi-perimeter." },
      { q: "Why do my three sides say 'not a triangle'?", a: "They violate the triangle inequality — one side is as long as or longer than the other two combined, so the triangle cannot close." },
      { q: "Which side is the base?", a: "Any side can be the base. Just make sure the height you use is measured perpendicular to that side." },
      { q: "Can I find the area without the height?", a: "Yes — use the three-sides method, which relies only on the side lengths." },
    ],
  },

  "distance-calculator": {
    intro: [
      "The Distance Calculator measures the straight-line distance between two points on a 2D plane. Enter the coordinates of point A and point B and it returns the distance along with the horizontal and vertical change.",
      "It applies the distance formula, which is the Pythagorean theorem applied to the horizontal and vertical gaps between the two points.",
    ],
    formula: {
      expression: "d = √((x₂ − x₁)² + (y₂ − y₁)²)",
      where: [
        ["x₁, y₁", "coordinates of the first point"],
        ["x₂, y₂", "coordinates of the second point"],
        ["d", "straight-line distance between them"],
      ],
    },
    howToUse: [
      "Enter the x and y coordinates of point A.",
      "Enter the x and y coordinates of point B.",
      "Read the distance plus the Δx and Δy differences.",
      "Coordinates can be negative or decimal values.",
    ],
    goodToKnow: [
      "The distance formula is just the Pythagorean theorem: Δx and Δy are the two legs, and the distance is the hypotenuse.",
      "The order of the points does not matter — swapping A and B gives the same distance.",
      "If both points share an x or y value, the distance equals the difference on the other axis.",
    ],
    faqs: [
      { q: "What does Δx and Δy mean?", a: "They are the differences in the x and y coordinates: Δx = x₂ − x₁ and Δy = y₂ − y₁." },
      { q: "Can I use negative coordinates?", a: "Yes. Points in any quadrant work; the squaring in the formula handles negative differences correctly." },
      { q: "Is this the shortest distance?", a: "Yes, it is the straight-line (Euclidean) distance, which is always the shortest path between two points on a plane." },
      { q: "How is this related to the Pythagorean theorem?", a: "The horizontal and vertical gaps form the two legs of a right triangle, and the distance is its hypotenuse." },
    ],
  },

  "surface-area-calculator": {
    intro: [
      "The Surface Area Calculator finds the total area of the outer faces of a 3D solid. Choose a cube, box, sphere, cylinder or cone, enter its dimensions and it returns the surface area in square units.",
      "Surface area matters whenever you need to cover, paint, wrap or coat an object, since it tells you exactly how much material the outside requires.",
    ],
    formula: {
      expression: "Cube 6s² · Box 2(lw+lh+wh) · Sphere 4πr² · Cylinder 2πr(r+h) · Cone πr(r+l), l = √(r²+h²)",
      where: [
        ["s", "side length of a cube"],
        ["l, w, h", "length, width and height"],
        ["r", "radius"],
        ["l", "slant height of a cone, √(r² + h²)"],
      ],
      note: "The cone and cylinder formulas include both the curved side and the flat circular ends.",
    },
    howToUse: [
      "Select the solid you want to cover.",
      "Enter each dimension in the same unit.",
      "Read the total surface area (the cone also shows its slant height).",
      "Switch shapes freely without retyping shared values.",
    ],
    goodToKnow: [
      "Surface area is measured in square units, while volume is measured in cubic units.",
      "A cone's slant height is longer than its vertical height — it runs along the sloping side.",
      "For a closed cylinder, the total area is the curved side (2πrh) plus the two circular ends (2πr²).",
    ],
    faqs: [
      { q: "What's the difference between surface area and volume?", a: "Surface area is the total area of the outside faces (square units); volume is the space inside (cubic units)." },
      { q: "What is slant height on a cone?", a: "The distance from the apex straight down the sloping side to the edge of the base, equal to √(r² + h²)." },
      { q: "Does the cylinder formula include the ends?", a: "Yes — 2πr(r + h) covers the curved wall plus both circular caps. Drop the 2πr² term for an open tube." },
      { q: "Why would I need surface area?", a: "For painting, wrapping, plating, heat-loss and material estimates — anything involving the outside of an object." },
    ],
  },

  "lcm-calculator": {
    intro: [
      "The LCM Calculator finds the least common multiple of a list of whole numbers — the smallest positive number that every value divides into evenly. It handles two or more numbers at once and also shows their greatest common factor.",
      "The LCM is essential for adding or comparing fractions, scheduling repeating events, and any problem where cycles need to line up.",
    ],
    formula: {
      expression: "lcm(a, b) = |a · b| ⁄ gcd(a, b)",
      where: [
        ["a, b", "two whole numbers"],
        ["gcd(a, b)", "their greatest common divisor"],
      ],
      note: "For more than two numbers, the LCM is built up pairwise: lcm(a, b, c) = lcm(lcm(a, b), c).",
    },
    howToUse: [
      "Type two or more whole numbers, separated by commas, spaces or new lines.",
      "The least common multiple appears instantly.",
      "The greatest common factor is shown alongside it.",
      "Decimals and zeros are flagged, since the LCM needs non-zero integers.",
    ],
    goodToKnow: [
      "The LCM of two numbers is never smaller than the larger of the two.",
      "If the numbers share no common factor, their LCM is simply their product.",
      "LCM × GCF equals the product of the two numbers (for a pair of numbers).",
    ],
    faqs: [
      { q: "What is the least common multiple?", a: "The smallest positive whole number that each of your numbers divides into with no remainder." },
      { q: "How is the LCM used with fractions?", a: "To add or subtract fractions you convert them to a common denominator, which is the LCM of the original denominators." },
      { q: "Why must the numbers be whole?", a: "Multiples are defined for integers. Decimals have no meaningful least common multiple." },
      { q: "What is the LCM of two coprime numbers?", a: "If two numbers share no common factor other than 1, their LCM is just their product." },
    ],
  },

  "gcf-calculator": {
    intro: [
      "The GCF Calculator finds the greatest common factor (also called the highest common factor, HCF, or greatest common divisor) of a list of whole numbers — the largest number that divides every value exactly. It also returns the least common multiple.",
      "The GCF is the key to simplifying fractions, splitting quantities into equal groups, and reducing ratios to their simplest form.",
    ],
    formula: {
      expression: "gcd(a, b) via the Euclidean algorithm: gcd(a, b) = gcd(b, a mod b) until b = 0",
      where: [
        ["a, b", "two whole numbers"],
        ["a mod b", "the remainder when a is divided by b"],
      ],
      note: "For more than two numbers, the GCF is found pairwise: gcf(a, b, c) = gcd(gcd(a, b), c).",
    },
    howToUse: [
      "Enter two or more whole numbers, separated by commas, spaces or new lines.",
      "The greatest common factor appears instantly.",
      "The least common multiple is shown alongside for reference.",
      "Decimals and zeros are flagged, since the GCF needs non-zero integers.",
    ],
    goodToKnow: [
      "The GCF is never larger than the smallest number in your list.",
      "If the GCF of two numbers is 1, they are called coprime (relatively prime).",
      "Dividing both parts of a fraction by their GCF gives the fully simplified fraction.",
    ],
    faqs: [
      { q: "Are GCF, HCF and GCD the same thing?", a: "Yes. Greatest common factor, highest common factor and greatest common divisor are three names for the same value." },
      { q: "How does the GCF simplify a fraction?", a: "Divide the numerator and denominator by their GCF; the result is the fraction in lowest terms." },
      { q: "What does the Euclidean algorithm do?", a: "It repeatedly replaces the larger number with the remainder of dividing the two, until the remainder is zero — the last non-zero value is the GCF." },
      { q: "What is the GCF if numbers share no factors?", a: "It is 1. Such numbers are said to be coprime or relatively prime." },
    ],
  },

  "pythagorean-theorem-calculator": {
    intro: [
      "The Pythagorean Theorem Calculator solves a right triangle's unknown side. Give it the two legs to find the hypotenuse, or give it the hypotenuse and one leg to find the missing leg.",
      "It applies the theorem a² + b² = c², which holds for every right-angled triangle and underpins distance, construction and navigation calculations.",
    ],
    formula: {
      expression: "a² + b² = c²   →   c = √(a² + b²),   a = √(c² − b²)",
      where: [
        ["a, b", "the two legs (the sides forming the right angle)"],
        ["c", "the hypotenuse (the side opposite the right angle)"],
      ],
      note: "The hypotenuse is always the longest side, so c must be greater than either leg.",
    },
    howToUse: [
      "Choose whether to solve for the hypotenuse or a leg.",
      "Enter the two known side lengths.",
      "Read the missing side and the formula used.",
      "When solving for a leg, the hypotenuse must exceed the known leg.",
    ],
    goodToKnow: [
      "The theorem only applies to right-angled triangles.",
      "Whole-number side sets like 3-4-5 and 5-12-13 are called Pythagorean triples.",
      "The hypotenuse is always opposite the right angle and is the longest side.",
    ],
    faqs: [
      { q: "What is the Pythagorean theorem?", a: "In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c²." },
      { q: "How do I find a leg instead of the hypotenuse?", a: "Rearrange to a = √(c² − b²): subtract the known leg's square from the hypotenuse's square, then take the root." },
      { q: "Why must the hypotenuse be the longest side?", a: "Because c² equals the sum of two positive squares, c is always larger than either leg." },
      { q: "Does this work for any triangle?", a: "No — only right-angled triangles. For other triangles use the law of cosines." },
    ],
  },

  "right-triangle-calculator": {
    intro: [
      "The Right Triangle Calculator takes the two legs of a right-angled triangle and computes everything else: the hypotenuse, the area, the perimeter and both acute angles.",
      "It combines the Pythagorean theorem with basic trigonometry, making it useful for construction, ramps, roof pitches and any layout that relies on a right angle.",
    ],
    formula: {
      expression: "c = √(a²+b²) · Area = ½·a·b · A = atan(a⁄b) · B = 90° − A",
      where: [
        ["a, b", "the two legs (perpendicular sides)"],
        ["c", "hypotenuse"],
        ["A", "angle opposite leg a, in degrees"],
        ["B", "angle opposite leg b, in degrees"],
      ],
      note: "The two acute angles always add up to 90°, because the third angle is the right angle.",
    },
    howToUse: [
      "Enter the length of each leg (the two sides that meet at the right angle).",
      "Read the hypotenuse, area and perimeter.",
      "Both acute angles are shown in degrees.",
      "The right angle is always 90°.",
    ],
    goodToKnow: [
      "The area of a right triangle is simply half the product of its two legs.",
      "The two non-right angles are complementary — they sum to exactly 90°.",
      "Angle A is opposite leg a; a longer leg a means a larger angle A.",
    ],
    faqs: [
      { q: "How is the area of a right triangle found?", a: "Multiply the two legs and halve the result: Area = ½ × a × b, since the legs act as base and height." },
      { q: "How are the angles calculated?", a: "Angle A = arctan(a ÷ b) in degrees, and angle B = 90° − A. Together the two acute angles make 90°." },
      { q: "What is the hypotenuse?", a: "The side opposite the right angle — the longest side — found with c = √(a² + b²)." },
      { q: "Why do the two acute angles add to 90°?", a: "A triangle's angles total 180°. With one angle fixed at 90°, the remaining two must sum to 90°." },
    ],
  },
};

export default info;
