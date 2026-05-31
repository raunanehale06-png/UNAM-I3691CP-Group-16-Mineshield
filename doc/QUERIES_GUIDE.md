# FIRESTORE QUERIES GUIDE - MINESHIELD

## Document Information

| Field | Details |
|-------|---------|
| **Author** | Frieda Angula |
| **Role** | Firebase Lead |
| **Date** | May 29, 2026 |
| **Version** | 1.0 |
| **Project** | MineShield - Group 16 |

---

## Table of Contents

1. [Overview](#overview)
2. [Basic Queries](#basic-queries)
3. [Hazard Queries](#hazard-queries)
4. [User Queries](#user-queries)
5. [Alert Queries](#alert-queries)
6. [Zone Queries](#zone-queries)
7. [Analytics Queries](#analytics-queries)
8. [Real-time Subscriptions](#real-time-subscriptions)
9. [Complex Queries](#complex-queries)
10. [Query Optimization](#query-optimization)
11. [Error Handling](#error-handling)
12. [Index Configuration](#index-configuration)

---

## Overview

This document provides a comprehensive guide to all Firestore queries used in the MineShield application. It covers basic CRUD operations, real-time subscriptions, filtered queries, pagination, and performance optimization techniques.

All queries are implemented in `src/services/firestoreService.js` and can be referenced throughout the application.

---

## Basic Queries

### Get a Single Document

```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Get a single hazard by ID
const getHazardById = async (hazardId) => {
  try {
    const docRef = doc(db, 'hazards', hazardId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};
