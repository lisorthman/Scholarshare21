"use client";

import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Paper {
  _id: string;
  title: string;
  authorId: string;
  author?: any;
  [key: string]: any;
}

const presetAmountsUSD = [1, 2, 5, 10];
const presetAmountsLKR = [150, 250, 500, 1000];
const exchangeRate = 250;

const DonateForm = ({ paperId }: { paperId: string | null }) => {
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  console.log("DonateForm rendered. paperId prop:", paperId);

  useEffect(() => {
    console.log("useEffect triggered. paperId:", paperId);
    if (!paperId) return; // Wait until paperId is available
    const fetchPapers = async () => {
      try {
        const res = await fetch("/api/papers/approved");
        const data = await res.json();
        setPapers(data);
        if (paperId) {
          const paper = data.find((p: Paper) => String(p._id) === String(paperId));
          if (paper) {
            setSelectedPaper(String(paper._id));
            let author = 'Unknown';
            if (paper.author && typeof paper.author === 'object' && paper.author.name) {
              author = paper.author.name;
            } else if (typeof paper.author === 'string') {
              author = paper.author;
            }
            setAuthorName(author);
          } else {
            setSelectedPaper(null);
            setAuthorName("");
          }
        }
      } catch (err) {
        toast.error("Failed to load papers");
      }
    };
    fetchPapers();
  }, [paperId]);

  useEffect(() => {
    console.log("useEffect triggered. paperId:", paperId, "papers.length:", papers.length);
    if (!paperId || papers.length === 0) return;
    const paper = papers.find((p: Paper) => String(p._id) === String(paperId));
    if (paper) {
      setSelectedPaper(String(paper._id));
      let author = 'Unknown';
      if (paper.author && typeof paper.author === 'object' && paper.author.name) {
        author = paper.author.name;
      } else if (typeof paper.author === 'string') {
        author = paper.author;
      }
      setAuthorName(author);
    } else {
      setSelectedPaper(null);
      setAuthorName("");
    }
  }, [paperId, papers]);

  const handlePaperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const paperId = e.target.value;
    setSelectedPaper(paperId);
    const paper = papers.find((p) => p._id === paperId);
    let author = 'Unknown';
    if (paper) {
      if (paper.author && typeof paper.author === 'object' && paper.author.name) {
        author = paper.author.name;
      } else if (typeof paper.author === 'string') {
        author = paper.author;
      }
    }
    setAuthorName(author);
  };

  const getPresetAmounts = () => {
    return currency === "USD" ? presetAmountsUSD : presetAmountsLKR;
  };

  // Step 1: Collect donation details and create PaymentIntent
  const handleDonationDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amountInLKR = currency === "USD" ? amount * exchangeRate : amount;
      const res = await axios.post("/api/stripe/create-payment-intent", {
        amount: amountInLKR,
        paperId: selectedPaper,
        name,
        remarks,
      });
      setClientSecret(res.data.clientSecret);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Stripe payment (inside <Elements>)
  const PaymentStep = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [localName, setLocalName] = useState(name);
    const [localRemarks, setLocalRemarks] = useState(remarks);

    const handlePaymentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;
      setPaying(true);
      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret!,
          {
            payment_method: {
              card: elements.getElement(CardNumberElement)!,
              billing_details: {
                name: localName,
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
        setPaying(false);
      }
    };

    return (
      <form onSubmit={handlePaymentSubmit} className={styles.right}>
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
        {/* Name and Remarks fields below card input */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Your Name</label>
          <input
            type="text"
            placeholder="Full name as on card"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Remarks (optional)</label>
          <textarea
            value={localRemarks}
            onChange={(e) => setLocalRemarks(e.target.value)}
            placeholder="Add a note to the author"
            className={styles.textarea}
          />
        </div>
        <button type="submit" className={styles.donateButton} disabled={paying}>
          {paying ? "Processing..." : "Donate Now"}
        </button>
      </form>
    );
  };

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
        {/* Left Side: Donation details */}
        <div className={styles.left}>
          <p className={styles.caption}>
            Every contribution you make will directly support the author and their 
            ongoing research efforts. Your donation helps sustain valuable academic work.
          </p>
          <form onSubmit={handleDonationDetailsSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Support for:</label>
              <select
                value={selectedPaper || ''}
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
                    className={`${styles.amountButton} ${amount === amt ? styles.selected : ""}`}
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
                min={currency === "USD" ? 0.5 : 60}
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
            <button
              type="submit"
              className={styles.donateButton}
              disabled={loading || !selectedPaper}
            >
              {loading ? "Processing..." : "Continue to Payment"}
            </button>
          </form>
        </div>
        {/* Right Side: Stripe payment form (step 2) */}
        <div className={styles.right}>
          {step === 2 && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <PaymentStep />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonateForm;