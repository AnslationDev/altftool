/**
 * Compute angular accelerations for a double pendulum.
 * Returns { alpha1, alpha2 } (already including linear damping).
 */
export function getAccelerations(
  theta1, theta2, omega1, omega2,
  L1, L2, m1, m2, g, damping = 0
) {
  const delta = theta1 - theta2;
  const sinDelta = Math.sin(delta);
  const cosDelta = Math.cos(delta);

  const denom = 2 * m1 + m2 - m2 * Math.cos(2 * delta);

  const num1 =
    -g * (2 * m1 + m2) * Math.sin(theta1) -
    m2 * g * Math.sin(theta1 - 2 * theta2) -
    2 * sinDelta * m2 * (omega2 * omega2 * L2 + omega1 * omega1 * L1 * cosDelta);
  const alpha1 = num1 / (L1 * denom);

  const num2 =
    2 *
    sinDelta *
    (omega1 * omega1 * L1 * (m1 + m2) +
      g * (m1 + m2) * Math.cos(theta1) +
      omega2 * omega2 * L2 * m2 * cosDelta);
  const alpha2 = num2 / (L2 * denom);

  return {
    alpha1: alpha1 - damping * omega1,
    alpha2: alpha2 - damping * omega2,
  };
}

/**
 * RK4 integration step for the double pendulum.
 * Returns new state { theta1, theta2, omega1, omega2 }.
 */
export function rk4Step(state, dt, L1, L2, m1, m2, g, damping) {
  const { theta1, theta2, omega1, omega2 } = state;

  const deriv = (t1, t2, w1, w2) => {
    const { alpha1, alpha2 } = getAccelerations(t1, t2, w1, w2, L1, L2, m1, m2, g, damping);
    return { dTheta1: w1, dTheta2: w2, dOmega1: alpha1, dOmega2: alpha2 };
  };

  const k1 = deriv(theta1, theta2, omega1, omega2);
  const dt2 = dt / 2;

  const k2 = deriv(
    theta1 + k1.dTheta1 * dt2,
    theta2 + k1.dTheta2 * dt2,
    omega1 + k1.dOmega1 * dt2,
    omega2 + k1.dOmega2 * dt2
  );
  const k3 = deriv(
    theta1 + k2.dTheta1 * dt2,
    theta2 + k2.dTheta2 * dt2,
    omega1 + k2.dOmega1 * dt2,
    omega2 + k2.dOmega2 * dt2
  );
  const k4 = deriv(
    theta1 + k3.dTheta1 * dt,
    theta2 + k3.dTheta2 * dt,
    omega1 + k3.dOmega1 * dt,
    omega2 + k3.dOmega2 * dt
  );

  return {
    theta1: theta1 + (dt / 6) * (k1.dTheta1 + 2 * k2.dTheta1 + 2 * k3.dTheta1 + k4.dTheta1),
    theta2: theta2 + (dt / 6) * (k1.dTheta2 + 2 * k2.dTheta2 + 2 * k3.dTheta2 + k4.dTheta2),
    omega1: omega1 + (dt / 6) * (k1.dOmega1 + 2 * k2.dOmega1 + 2 * k3.dOmega1 + k4.dOmega1),
    omega2: omega2 + (dt / 6) * (k1.dOmega2 + 2 * k2.dOmega2 + 2 * k3.dOmega2 + k4.dOmega2),
  };
}