import styles from './Card.module.css';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
    style?: React.CSSProperties;
    glass?: boolean;
}

export default function Card({ title, children, className, action, style, glass }: CardProps) {
    return (
        <div className={`${styles.card} ${glass ? 'glass-card' : ''} ${className || ''}`} style={style}>
            {(title || action) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {action && <div className={styles.action}>{action}</div>}
                </div>
            )}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}
