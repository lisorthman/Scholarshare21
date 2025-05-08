import { HTMLAttributes } from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  circle = false,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const skeletonStyle = {
    width,
    height,
    borderRadius: circle ? '50%' : '0.25rem',
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={skeletonStyle}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <Skeleton width="80%" height="1.5rem" />
      <Skeleton width="60%" height="1rem" />
      <Skeleton width="100%" height="2.5rem" />
      <div className={styles.skeletonFooter}>
        <Skeleton width="30%" height="0.875rem" />
        <Skeleton width="20%" height="0.875rem" />
      </div>
    </div>
  );
}