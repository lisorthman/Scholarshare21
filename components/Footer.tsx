// components/Footer.tsx
import Link from 'next/link';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import styles from './Navbar.module.scss';;


const Footer = () => {
  return (
    <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        {/* About Section */}
        <nav className={styles.navBar}>
        <div>
        <h2  className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-blue-600 p-2 rounded mr-2">
            </span>
            ScholarShare
          </h2>
          </div>
          <div>
          <ul className={styles.navLinks}>
            <li>
              <u>
              <Link href="/about" className="text-gray-200 hover:text-white transition flex items-center">
                About us
              </Link>
              </u>
            </li>
            <li>
              <u>
              <Link href="/services" className="text-gray-200 hover:text-white transition flex items-center">
                Services
              </Link>
              </u>
            </li>
            <li>
              <u>
              <Link href="/reviews" className="text-gray-200 hover:text-white transition flex items-center">
                Review
              </Link>
              </u>
            </li>
            <li>
              <u>
              <Link href="/login" className="text-gray-200 hover:text-white transition flex items-center">
                Login
              </Link>
              </u>
            </li>
          </ul>
          </div>
        {/* social media icons */}
        <div className="flex space-x-4">
            <a href="#" className="text-gray-200 hover:text-white transition">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-gray-200 hover:text-white transition">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-gray-200 hover:text-white transition">
              <FaLinkedin size={20} />
            </a>
            <a href="#" className="text-gray-200 hover:text-white transition">
              <FaInstagram size={20} />
            </a>
            </div>
          </nav>

        {/* Contact Information */}
        <table width="100%">
        <tr>
        <th>
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact us</h3>
          <address className="not-italic text-gray-200">
            <div className="flex items-center mb-3">
              <FaEnvelope className="mr-2 text-blue-400" />
              <a href="mailto:scholarshare@uom.it" className="hover:text-white transition">
                scholarshare@uom.it
              </a>
            </div>
            <div className="flex items-center mb-3">
              <FaPhone className="mr-2 text-blue-400" />
              <a href="tel:0743802400" className="hover:text-white transition">
                0743802400
              </a>
            </div>
            <div className="flex items-start">
              <FaMapMarkerAlt className="mr-2 mt-1 text-blue-400" />
              <span>
                1234 Main St<br />Colombo DD08
              </span>
            </div>
          </address>
        </div>
        </th>

        {/* Newsletter Subscription */}
        <th>
          <div>
          <form className="flex flex-col space-y-4">
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-grow px-4 py-2 text-gray-800 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                required/>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition"
                >
                  Subscribe to news
                </button>
              </div>
            </form>
          </div>
        </th>
        </tr>
        </table>
        <hr />
        <br />
  
        {/* Bottom Bar */}
        <center>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300 mb-4 md:mb-0">
            © {new Date().getFullYear()} ScholarShare. All Rights Reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-sm text-gray-300 hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-300 hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-gray-300 hover:text-white transition">
              Cookie Policy
            </Link>
          </div>
        </div>
        </center>
      </footer>
    );
  };
  
  export default Footer;