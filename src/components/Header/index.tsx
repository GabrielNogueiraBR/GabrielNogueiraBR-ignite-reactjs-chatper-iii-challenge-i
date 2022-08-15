import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={commonStyles.container}>
        <Link href="/">
          <img src="/assets/logo.svg" alt="logo" className={styles.logo} />
        </Link>
      </div>
    </header>
  );
}
