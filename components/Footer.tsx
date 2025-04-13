import Link from 'next/link';
import Image from 'next/image';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Top Section */}
        <div className={styles.topSection}>
          {/* Logo Section */}
          <div className={styles.logoSection}>
            <Image
              src="/logo.png"
              alt="ScholarShare Logo"
              width={280}
              height={65}
              className={styles.logoImage}
              priority
            />
          </div>

          {/* Navigation Links */}
          <nav className={styles.navLinks}>
            <Link href="/about" className={styles.navLink}>About us</Link>
            <Link href="/services" className={styles.navLink}>Services</Link>
            <Link href="/login" className={styles.navLink}>Login</Link>
          </nav>

          {/* Social Media Icons */}
          <div className={styles.socialIcons}>
            <a href="#" className={styles.socialIcon}><FaFacebook /></a>
            <a href="#" className={styles.socialIcon}><FaTwitter /></a>
            <a href="#" className={styles.socialIcon}><FaLinkedin /></a>
            <a href="#" className={styles.socialIcon}><FaInstagram /></a>
          </div>
        </div>

        {/* Contact and Subscribe Section */}
        <div className={styles.middleSection}>
          {/* Contact Information */}
          <div className={styles.contactInfo}>
            <h3 className={styles.sectionTitle}>Contact us</h3>
            <address className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <a href="mailto:scholarshare@uom.it">scholarshare@uom.it</a>
              </div>
              <div className={styles.contactItem}>
                <FaPhone className={styles.contactIcon} />
                <a href="tel:0743802400">0743802400</a>
              </div>
              <div className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span>1234 Main St<br />Colombo DD08</span>
              </div>
            </address>
          </div>

          {/* Subscribe Form */}
          <div className={styles.subscribeForm}>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  placeholder="Email"
                  className={styles.formInput}
                  required
                />
                <button type="submit" className={styles.formButton}>
                  Subscribe to news
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} ScholarShare. All Rights Reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link href="/privacy-policy" className={styles.legalLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
            <Link href="/cookies" className={styles.legalLink}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;