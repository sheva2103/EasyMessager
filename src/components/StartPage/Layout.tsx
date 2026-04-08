import React, { FC, ReactNode, useEffect, useRef } from "react";
import styles from './StartPage.module.scss'

type FloatingItem = {
    el: HTMLDivElement;
    speed: number;
    radius: number;
    angle: number;
};

const icons = [
                <path d="M4 4h16v12H5.17L4 17.17V4zm0-2a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4z" />,
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.89.76.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5c.55 0 1 .45 1 1 0 1.36.27 2.68.76 3.89.14.26.09.59-.21 1.11l-2.43 2.79z" />,
                <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />,
                <path d="M21 15.46l-5.27-.61-2.11 2.11a16.05 16.05 0 0 1-7.59-7.59l2.11-2.11L8.54 3H3v5.27l2.11 2.11a18.05 18.05 0 0 0 8.62 8.62l2.11 2.11H21v-5.27z" />,
                <path d="M4 4h16v12H5.17L4 17.17V4zm0-2a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4z" />,
                <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.89.76.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5c.55 0 1 .45 1 1 0 1.36.27 2.68.76 3.89.14.26.09.59-.21 1.11l-2.43 2.79z" />,
                <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />,
                <path d="M21 15.46l-5.27-.61-2.11 2.11a16.05 16.05 0 0 1-7.59-7.59l2.11-2.11L8.54 3H3v5.27l2.11 2.11a18.05 18.05 0 0 0 8.62 8.62l2.11 2.11H21v-5.27z" />,
            ]

const BubbleBackground: FC<{ children: ReactNode }> = ({ children }) => {
    const itemsRef = useRef<FloatingItem[]>([]);

    useEffect(() => {
        const animate = () => {
            itemsRef.current.forEach((item) => {
                item.angle += item.speed;
                const x = Math.sin(item.angle) * item.radius;
                const y = Math.cos(item.angle) * item.radius;
                item.el.style.transform = `translate(${x}px, ${y}px)`;
            });
            requestAnimationFrame(animate);
        };
        animate();
    }, []);

    const createItemRef = (
        el: HTMLDivElement | null,
        speed: number,
        radius: number
    ) => {
        if (el) {
            itemsRef.current.push({
                el,
                speed,
                radius,
                angle: Math.random() * Math.PI * 2,
            });
        }
    };

    return (
        <div className={styles.layoutAnimation}>
            {children}
            {[...Array(6)].map((_, i) => (
                <div
                    key={`bubble-${i}`}
                    ref={(el) => createItemRef(el, 0.004 + i * 0.001, 100 + i * 30)}
                    style={{
                        position: "absolute",
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`,
                        width: `${50 + i * 15}px`,
                        height: `${50 + i * 15}px`,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0.05))",
                        filter: "blur(8px)",
                        backdropFilter: "contrast(1.3) saturate(1.2)",
                        mixBlendMode: "overlay",
                    }}
                />
            ))}
            {/* {icons.map((iconPath, i) => (
                <div
                    key={`icon-${i}`}
                    ref={(el) => createItemRef(el, 0.002 + i * 0.001, 120 + i * 20)}
                    style={{
                        position: "absolute",
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`,
                        width: "50px",
                        height: "50px",
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="white"
                        width="100%"
                        height="100%"
                        style={{ opacity: 0.7 }}
                    >
                        {iconPath}
                    </svg>
                </div>
            ))} */}
        </div>
    );
};

export default BubbleBackground;
