"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// 🔥 Firebase Imports
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";

// ✅ REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ₹ Formatter
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(n || 0);

export default function DigitalWalletFirebase() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("in");
  const [note, setNote] = useState("");

  // ✅ Auto Login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) setUser(u);
      else await signInAnonymously(auth);
    });
    return () => unsub();
  }, []);

  // ✅ Firestore Listener
  useEffect(() => {
    if (!user) return;

    const walletRef = doc(db, "users", user.uid, "meta", "wallet");
    onSnapshot(walletRef, (snap) => {
      if (snap.exists()) setBalance(snap.data().balance || 0);
      else setDoc(walletRef, { balance: 0 });
    });

    const txRef = collection(db, "users", user.uid, "transactions");
    const q = query(txRef, orderBy("createdAt", "desc"));
    onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setTransactions(arr);
    });
  }, [user]);

  // ✅ Add Transaction
  const addTransaction = async () => {
    if (!amount) return alert("Enter amount");

    const tx = {
      type,
      amount: Number(amount),
      note,
      createdAt: new Date(),
    };

    const txRef = collection(db, "users", user.uid, "transactions");
    await addDoc(txRef, tx);

    const walletRef = doc(db, "users", user.uid, "meta", "wallet");
    const snap = await getDoc(walletRef);

    const current = snap.data()?.balance || 0;
    const newBalance =
      type === "in" ? current + Number(amount) : current - Number(amount);

    await setDoc(walletRef, { balance: newBalance });

    setAmount("");
    setNote("");
  };

  // ✅ Delete Transaction
  const deleteTx = async (id, tx) => {
    if (!confirm("Delete transaction?")) return;

    await deleteDoc(
      doc(db, "users", user.uid, "transactions", id)
    );

    const walletRef = doc(db, "users", user.uid, "meta", "wallet");
    const snap = await getDoc(walletRef);
    const current = snap.data()?.balance || 0;

    const newBalance =
      tx.type === "in"
        ? current - tx.amount
        : current + tx.amount;

    await setDoc(walletRef, { balance: newBalance });
  };

  return (
    <Box sx={{ minHeight: "100vh", p: 3, color: "white" }}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography variant="h4" mb={2}>
          💰 Digital Wallet
        </Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography>Balance</Typography>
            <Typography variant="h3">{fmt(balance)}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="in">Add</MenuItem>
                <MenuItem value="out">Expense</MenuItem>
              </Select>

              <TextField
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <TextField
                label="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <Button variant="contained" onClick={addTransaction}>
                Save
              </Button>
            </Box>

            {transactions.map((tx) => (
              <Box
                key={tx.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  mt: 1,
                  bgcolor: "#0f172a",
                  borderRadius: 1,
                }}
              >
                <Typography>{tx.note || "Transaction"}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>{fmt(tx.amount)}</Typography>
                  <IconButton onClick={() => deleteTx(tx.id, tx)}>
                    <DeleteIcon sx={{ color: "red" }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
