"use client";

import React, { useEffect, useState } from "react";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./Donate.module.scss";

interface Paper {
  _id: string;
  title: string;
  author: {
    name: string;
    _id: string;
  };
}

// Updated preset amounts to avoid minimum threshold issues
const presetAmountsUSD = [1, 2, 5, 10]; // Now starts at $1 instead of $0.50
const presetAmountsLKR = [100, 250, 500, 1000]; // Starts at 100 LKR
const exchangeRate = 250; // 1 USD = 250 LKR

const DonateForm = ({ paperId }: { paperId: string | null }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string | null>(paperId);
  const [authorName, setAuthorName] = useState("");
  const [currency, setCurrency] = useState<"USD" | "LKR">("USD");
  const [amount, setAmount] = useState<number>(1);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch("/api/papers/approved");
        const data = await res.json();
        setPapers(data);

        // If coming from specific paper, set the author name
        if (paperId) {
          const paper = data.find((p: Paper) => p._id === paperId);
          if (paper) setAuthorName(paper.author.name);
        }
      } catch (err) {
        toast.error("Failed to load papers");
      }
    };
    fetchPapers();
  }, [paperId]);

  const handlePaperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const paperId = e.target.value;
    setSelectedPaper(paperId);

    // Set author name when paper is selected
    const paper = papers.find((p) => p._id === paperId);
    if (paper) setAuthorName(paper.author.name);
  };

  // Updated amount handling
  const getPresetAmounts = () => {
    return currency === "USD" ? presetAmountsUSD : presetAmountsLKR;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Convert amount to LKR if currency is USD
      const amountInLKR = currency === "USD" ? amount * exchangeRate : amount;

      const res = await axios.post("/api/stripe/create-payment-intent", {
        amount: amountInLKR,
        paperId: selectedPaper,
        name,
        remarks,
      });

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        res.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardNumberElement)!,
            billing_details: {
              name: name,
            },
          },
        }
      );

      if (error) {
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        setSuccess(true);
        toast.success("Thank you for your donation! 💐");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!stripe || !elements) {
    return <div>Loading payment gateway...</div>;
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.thankYouContainer}>
          <h2>Thank You for Your Support!</h2>
          <div className={styles.celebration}>
            {[...Array(10)].map((_, i) => (
              <div key={i} className={styles.flower}>&#10048;</div>
            ))}
          </div>
          <p>Your donation helps support important research.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Support the Author</h1>
      <div className={styles.donationBox}>
        {/* Left Side */}
        <div className={styles.left}>
          <p className={styles.caption}>
            Every contribution you make will directly support the author and their 
            ongoing research efforts. Your donation helps sustain valuable academic work.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Support for:</label>
            <select
              value={selectedPaper || ""}
              onChange={handlePaperChange}
              className={styles.dropdown}
              required
            >
              <option value="">Select a Paper</option>
              {papers.map((paper) => (
                <option key={paper._id} value={paper._id}>
                  {paper.title}
                </option>
              ))}
            </select>
          </div>

          {selectedPaper && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Author:</label>
              <input
                type="text"
                value={authorName}
                readOnly
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Amount ({currency}):</label>
            <div className={styles.amountButtons}>
              {getPresetAmounts().map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => {
                    setAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`${styles.amountButton} ${
                    amount === amt ? styles.selected : ""
                  }`}
                >
                  {currency === "USD" ? `$${amt}` : `Rs. ${amt}`}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <input
              type="number"
              placeholder={`Custom Amount (${currency})`}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) setAmount(value);
              }}
              className={styles.input}
              min={currency === "USD" ? 0.5 : 60} // Updated minimums
              step={currency === "USD" ? 0.1 : 10}
            />
          </div>

          <button
            type="button"
            onClick={() => setCurrency(currency === "USD" ? "LKR" : "USD")}
            className={styles.currencyToggle}
          >
            Switch to {currency === "USD" ? "LKR" : "USD"}
          </button>
        </div>

        {/* Right Side */}
        <div className={styles.right}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Card Number</label>
              <CardNumberElement className={styles.cardInput} />
            </div>

            <div className={styles.doubleInputs}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Expiry Date</label>
                <CardExpiryElement className={styles.cardInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>CVC</label>
                <CardCvcElement className={styles.cardInput} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Your Name</label>
              <input
                type="text"
                placeholder="Full name as on card"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Remarks (optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add a note to the author"
                className={styles.textarea}
              />
            </div>

            <button
              type="submit"
              className={styles.donateButton}
              disabled={loading || !selectedPaper}
            >
              {loading ? "Processing..." : "Donate Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonateForm;