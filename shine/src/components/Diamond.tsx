import React, { useEffect } from 'react';
import Animated, {
  useAnimatedProps,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Polygon, RadialGradient, Stop } from 'react-native-svg';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 300;
const C = SIZE / 2;
const SCALE = 78;

// Ethereum-style diamond: an elongated top pyramid over a shorter bottom one.
const VERTS: [number, number, number][] = [
  [0, -1.45, 0], // 0 top
  [1, 0, 0], // 1
  [0, 0, 1], // 2
  [-1, 0, 0], // 3
  [0, 0, -1], // 4
  [0, 1, 0], // 5 bottom
];
const FACES: [number, number, number][] = [
  [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
  [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4],
];

type Props = { energy: number };

/**
 * A translucent diamond. `energy` (0..1) drives spin speed, opacity and glow.
 * Geometry is projected inside a worklet so the UI thread animates it with no
 * React re-renders.
 */
export function Diamond({ energy }: Props) {
  const e = useSharedValue(energy);
  const angle = useSharedValue(0.6);
  const pulse = useSharedValue(0);

  useEffect(() => {
    e.value = withTiming(energy, { duration: 900 });
  }, [energy, e]);

  useFrameCallback((frame) => {
    const dt = (frame.timeSincePreviousFrame ?? 16) / 1000;
    // 0.25 rad/s when dormant up to ~5 rad/s when radiant.
    const speed = 0.25 + 4.8 * e.value * e.value;
    angle.value += dt * speed;
    pulse.value += dt * (1.2 + 3 * e.value);
  });

  const faceProps = FACES.map((face, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedProps(() => {
      const a = angle.value;
      const tilt = 0.28;
      const ca = Math.cos(a), sa = Math.sin(a);
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      const pts: number[] = [];
      let nz = 0;
      let nxAcc = 0, nyAcc = 0, nzAcc = 0;
      const p3 = face.map((vi) => {
        const [x, y, z] = VERTS[vi];
        const rx = x * ca + z * sa;
        const rz = -x * sa + z * ca;
        const ry = y * ct - rz * st;
        const rz2 = y * st + rz * ct;
        pts.push(C + rx * SCALE, C + 6 + ry * SCALE);
        return [rx, ry, rz2];
      });
      // face normal for lighting / front-vs-back
      const ux = p3[1][0] - p3[0][0], uy = p3[1][1] - p3[0][1], uz = p3[1][2] - p3[0][2];
      const vx = p3[2][0] - p3[0][0], vy = p3[2][1] - p3[0][1], vz = p3[2][2] - p3[0][2];
      nxAcc = uy * vz - uz * vy;
      nyAcc = uz * vx - ux * vz;
      nzAcc = ux * vy - uy * vx;
      const len = Math.hypot(nxAcc, nyAcc, nzAcc) || 1;
      nz = nzAcc / len;
      const light = Math.max(0, (-nxAcc * 0.4 + -nyAcc * 0.7 + nzAcc * 0.6) / len);
      const facing = nz > 0 ? 1 : 0.45; // far faces are fainter, still visible through glass
      const en = e.value;
      // dull grey-blue -> icy cyan -> violet-white as it shines
      const r = Math.round(120 + en * 90 + light * 60);
      const g = Math.round(135 + en * 85 + light * 50);
      const b = Math.round(165 + en * 90 + light * 30);
      const alpha = (0.1 + en * 0.45 + light * (0.12 + en * 0.3)) * facing;
      const tint = i % 2 === 0 ? 0 : 14 * en; // alternate facets differ a little
      return {
        points: pts.join(','),
        fill: `rgba(${Math.min(255, r - tint)},${Math.min(255, g)},${Math.min(255, b + tint)},${alpha.toFixed(3)})`,
        stroke: `rgba(255,255,255,${(0.25 + en * 0.6) * facing})`,
      };
    }),
  );

  const glowProps = useAnimatedProps(() => {
    const en = e.value;
    const breathe = 1 + 0.06 * Math.sin(pulse.value);
    return {
      r: (70 + en * 80) * breathe,
      opacity: 0.05 + en * 0.8,
    };
  });

  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#9fe8ff" stopOpacity="0.9" />
          <Stop offset="0.5" stopColor="#8a7dff" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#8a7dff" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <AnimatedCircle cx={C} cy={C} fill="url(#glow)" animatedProps={glowProps} />
      {FACES.map((_, i) => (
        <AnimatedPolygon key={i} strokeWidth={1.2} strokeLinejoin="round" animatedProps={faceProps[i]} />
      ))}
    </Svg>
  );
}
