# MineShield App — Test Coverage Document

| Field | Details |
|-------|---------|
| **Document Version** | 1.0 |
| **Last Updated** | 31/05/2026 |
| **Prepared By** | Teopolina Negonga |
| **Role** | Testing Lead |

---

## 1. Coverage Summary

| Category | Total Requirements | Tested | Covered | Not Covered | Coverage % |
|----------|--------------------|--------|---------|-------------|------------|
| Functional Requirements (FR-001 to FR-015) | 15 | 15 | 15 | 0 | 100% |
| Non-Functional Requirements | 5 | 5 | 5 | 0 | 100% |
| Edge Cases | 15 | 15 | 15 | 0 | 100% |
| **OVERALL** | **35** | **35** | **35** | **0** | **100%** |

---

## 2. Functional Requirements Coverage

| FR Ref | Description | Test Case ID | Status | Device Tested |
|--------|-------------|--------------|--------|---------------|
| FR-001 | User Registration | TC-001 | Pass | Android 13, 15, 16 |
| FR-002 | Secure Login and Logout | TC-002 | Pass | Android 13, 15, 16 |
| FR-003 | Hazard Reporting with Description | TC-003 | Pass | Android 13, 15, 16 |
| FR-004 | Real-Time Hazard Storage | TC-004 | Pass | Android 13, 15, 16 |
| FR-005 | Hazards Displayed on Live Map | TC-005 | Pass | Android 13, 15, 16 |
| FR-006 | Zone Classification by Risk Level | TC-006 | Pass | Android 13, 15, 16 |
| FR-007 | Fall Detection Using Accelerometer | TC-007 | Pass | Android 13, 15, 16 |
| FR-008 | Noise Level Monitoring | TC-008 | Pass | Android 13, 15, 16 |
| FR-009 | Alerts Sent When Thresholds Exceeded | TC-009 | Pass | Android 13, 15, 16 |
| FR-010 | SOS Alert with Last Known Location | TC-010 | Pass | Android 13, 15, 16 |
| FR-011 | Supervisor Dashboard Display | TC-011 | Pass | Android 13, 15, 16 |
| FR-012 | Viewing Past Hazard Reports | TC-012 | Pass | Android 13, 15, 16 |
| FR-013 | Analytics Report Generation | TC-013 | Pass | Android 13, 15, 16 |
| FR-014 | Visitor Alert Reception | TC-014 | Pass | Android 13, 15, 16 |
| FR-015 | Image Upload Support | TC-015 | Pass | Android 13, 15, 16 |

---

## 3. Non-Functional Requirements Coverage

| Category | Requirement | Test Method | Status |
|----------|-------------|-------------|--------|
| Performance | Dashboard loads within 3 seconds | Manual timing | Pass |
| Performance | Real-time updates within 2 seconds | Manual observation | Pass |
| Performance | Map updates within 5 seconds | Manual observation | Pass |
| Security | Authentication required for all access | Functional testing | Pass |
| Security | Role-based access control | Functional testing | Pass |
| Usability | Simple and intuitive interface | User feedback | Pass |
| Compatibility | Android 10+ and Expo Go support | Device matrix | Pass |
| Reliability | Data not lost during network failure | Edge case EC-007 | Pass |
| Reliability | Offline buffering supported | Edge case testing | Pass |

---

## 4. Device Coverage Matrix

| Device | Android Version | Role | Tests Executed | Pass | Fail | Blocked |
|--------|-----------------|------|----------------|------|------|---------|
| Samsung Tab A9 | 16 | Supervisor | 15 | 15 | 0 | 0 |
| Samsung A06 | 15 | Worker | 15 | 15 | 0 | 0 |
| Samsung A03 core | 13 | Visitor | 15 | 15 | 0 | 0 

---

## 5. Test Type Coverage

| Test Type | Number of Tests | Executed | Pass Rate |
|-----------|-----------------|----------|-----------|
| Unit Tests | 2 | 2 | 100% |
| Integration Tests | 13 | 13 | 100% |
| End-to-End Tests | 1 | 1 | 100% |
| Regression Tests | 12 | 12 | 100% |
| Edge Case Tests | 15 | 15 | 100% |

---

## 6. Bug Coverage

| Severity | Number Found | Fixed | Open | Fixed % |
|----------|--------------|-------|------|---------|
| Critical | 1 | 1 | 0 | 100% |
| Major | 6 | 6 | 0 | 100% |
| Minor | 3 | 3 | 0 | 100% |
| **Total** | **10** | **10** | **0** | **100%** |

---

## 7. Uncovered Areas

| Area | Reason | Planned Date |
|------|--------|--------------|
| None | All requirements covered | N/A |

---

## 8. Sign Off

| Role | Name | Status | Date |
|------|------|-----------|------|
| Testing Lead | Teopolina Negonga | Approved | 31/05/2026 |
| Project Manager | Simon Shitana | Aprroved | 31/05/2026 |

---

*End of Test Coverage Document — MineShield App — 31 May 2026*
