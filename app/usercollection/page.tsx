"use client";

import React, { useState } from "react";
import {Button} from "../../components/ui/Button"; // Adjust path as needed
import NavBar from "../../components/Navbar"; 
import Sidebar from "../../components/Sidebar"; 

interface ResearchPaper {
  id: number;
  title: string;
  author: string;
  preview: string;
}

const UserCollectionPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [papers] = useState<ResearchPaper[]>([
    {
      id: 1,
      title: "AI in Healthcare",
      author: "John Doe",
      preview: "Brief about AI in medicine...",
    },
    {
      id: 2,
      title: "Quantum Computing",
      author: "Jane Smith",
      preview: "An introduction to quantum mechanics...",
    },
    {
      id: 3,
      title: "Alternative Fuels for Sustainable Transportation",
      author: "Alice Brown",
      preview: "Exploring renewable energy sources for transportation...",
    },
    {
      id: 4,
      title: "The Impact of Lifestyle on Cardiovascular Diseases",
      author: "Mark Wilson",
      preview: "Investigating lifestyle choices and their effects on heart health...",
    },
    {
      id: 5,
      title: "Sentiment Analysis of Social Media Using Deep Learning",
      author: "Emily Davis",
      preview: "Applying deep learning models for sentiment analysis on social media data...",
    },
    {
      id: 6,
      title: "Decentralized Research Paper Repository Using Next.js and IPFS",
      author: "Sam Lee",
      preview: "Building a decentralized repository for research papers with Next.js and IPFS...",
    },
    {
      id: 7,
      title: "Role-Based Access Control in Web Applications Using Laravel",
      author: "John Doe",
      preview: "Explaining the implementation of RBAC in web applications using Laravel...",
    },
    {
      id: 8,
      title: "The Role of Poetry in Expressing Human Emotions",
      author: "Lisa Green",
      preview: "A deep dive into the emotional impact of poetry on human expression...",
    },
  ]);

  const loggedInUser = "John Doe"; // Replace with actual auth

  const filteredPapers = papers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f7fafc" }}>
      <Sidebar onLogout={() => alert("Logged out successfully")} />
      <div
        style={{
          flex: 1,
          padding: "2rem",
          backgroundColor: "#E0D8C3",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "0.5rem",
        }}
      >
        <NavBar />

        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: "600",
            textAlign: "center",
            color: "#2d3748",
            marginBottom: "2rem",
          }}
        >
          User Collection
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
            border: "1px solid #e2e8f0",
            borderRadius: "0.375rem",
          }}
        >
          <input
            type="text"
            placeholder="Search papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "1rem",
              fontSize: "1.125rem",
              border: "none",
              borderRadius: "0.375rem",
              outline: "none",
              boxShadow: "none",
            }}
          />
          {loggedInUser ? (
            <Button onClick={() => alert(`Welcome, ${loggedInUser}`)}>
              {loggedInUser}
            </Button>
          ) : (
            <Button onClick={() => alert("Sign Up functionality here")}>
              Sign Up
            </Button>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1.5rem",
          }}
        >
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              style={{
                padding: "1.5rem",
                backgroundColor: "#f7fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "500",
                  color: "#4a5568",
                }}
              >
                {paper.title}
              </h3>
              <p style={{ fontSize: "1rem", color: "#718096" }}>
                By {paper.author}
              </p>
              <p style={{ fontSize: "1rem", color: "#4a5568" }}>
                {paper.preview}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserCollectionPage;
