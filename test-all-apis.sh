#!/bin/bash

# Comprehensive API Testing Script - All Endpoints
# Tests every single API endpoint in your application

echo "=========================================="
echo "COMPREHENSIVE API TESTING - ALL ENDPOINTS"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

test_endpoint() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    local name="$1"
    local response="$2"
    local expected="$3"
    
    echo "Test $TOTAL_TESTS: $name"
    echo "Response: $response"
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

echo "=========================================="
echo "PART 1: AUTHENTICATION APIs"
echo "=========================================="
echo ""

# 1. Register Student
echo "1. POST /api/auth/signup (Student)"
STUDENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test Student API",
    "email": "student_api@example.com",
    "password": "Password123",
    "userType": "Student"
  }')
test_endpoint "Register Student" "$STUDENT_RESPONSE" "token"

STUDENT_TOKEN=$(echo "$STUDENT_RESPONSE" | jq -r '.token' 2>/dev/null)
STUDENT_ID=$(echo "$STUDENT_RESPONSE" | jq -r '.user.userId' 2>/dev/null)

# 2. Register Coach
echo "2. POST /api/auth/signup (Coach)"
COACH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test Coach API",
    "email": "coach_api@example.com",
    "password": "Password123",
    "userType": "Coach"
  }')
test_endpoint "Register Coach" "$COACH_RESPONSE" "token"

COACH_TOKEN=$(echo "$COACH_RESPONSE" | jq -r '.token' 2>/dev/null)
COACH_ID=$(echo "$COACH_RESPONSE" | jq -r '.user.userId' 2>/dev/null)

# 3. Login
echo "3. POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student_api@example.com",
    "password": "Password123"
  }')
test_endpoint "Login" "$LOGIN_RESPONSE" "token"

# 4. Verify Token
echo "4. GET /api/auth/verify-token"
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/verify-token" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_endpoint "Verify Token" "$VERIFY_RESPONSE" "userId"

# 5. Get All Users
echo "5. GET /api/auth/users"
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/users" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_endpoint "Get All Users" "$USERS_RESPONSE" "email"

echo "=========================================="
echo "PART 2: STUDENT APIs"
echo "=========================================="
echo ""

# 6. Create Student Profile
echo "6. POST /api/students"
CREATE_STUDENT=$(curl -s -X POST "$BASE_URL/api/students" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$STUDENT_ID\",
    \"fullName\": \"Test Student\",
    \"sports\": [\"Tennis\", \"Football\"],
    \"location\": {
      \"type\": \"Point\",
      \"coordinates\": [77.2, 28.6]
    }
  }")
test_endpoint "Create Student Profile" "$CREATE_STUDENT" "fullName"

# 7. Get Student by ID
echo "7. GET /api/students/:userId"
GET_STUDENT=$(curl -s -X GET "$BASE_URL/api/students/$STUDENT_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_endpoint "Get Student by ID" "$GET_STUDENT" "fullName"

# 8. Update Student
echo "8. PUT /api/students/:userId"
UPDATE_STUDENT=$(curl -s -X PUT "$BASE_URL/api/students/$STUDENT_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Student Name"
  }')
test_endpoint "Update Student" "$UPDATE_STUDENT" "Updated"

echo "=========================================="
echo "PART 3: COACH APIs"
echo "=========================================="
echo ""

# 9. Create Coach Profile
echo "9. POST /api/coaches"
CREATE_COACH=$(curl -s -X POST "$BASE_URL/api/coaches" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$COACH_ID\",
    \"fullName\": \"Test Coach\",
    \"sports\": \"Tennis\",
    \"experience\": 5,
    \"location\": {
      \"type\": \"Point\",
      \"coordinates\": [77.2, 28.6]
    }
  }")
test_endpoint "Create Coach Profile" "$CREATE_COACH" "fullName"

# 10. Get Coach by ID
echo "10. GET /api/coaches/:userId"
GET_COACH=$(curl -s -X GET "$BASE_URL/api/coaches/$COACH_ID" \
  -H "Authorization: Bearer $COACH_TOKEN")
test_endpoint "Get Coach by ID" "$GET_COACH" "fullName"

# 11. Update Coach
echo "11. PUT /api/coaches/:userId"
UPDATE_COACH=$(curl -s -X PUT "$BASE_URL/api/coaches/$COACH_ID" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "experience": 10
  }')
test_endpoint "Update Coach" "$UPDATE_COACH" "experience"

# 12. Search Coaches
echo "12. GET /api/coaches/search?query=tennis"
SEARCH_COACHES=$(curl -s -X GET "$BASE_URL/api/coaches/search?query=tennis")
test_endpoint "Search Coaches" "$SEARCH_COACHES" "[]"

echo "=========================================="
echo "PART 4: TRAINING PROGRAM APIs"
echo "=========================================="
echo ""

# 13. Create Training Program
echo "13. POST /api/training-program/create"
CREATE_PROGRAM=$(curl -s -X POST "$BASE_URL/api/training-program/create" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"coachId\": \"$COACH_ID\",
    \"title\": \"Tennis Basics\",
    \"description\": \"Learn tennis fundamentals\",
    \"price\": 5000,
    \"durationDays\": 30,
    \"totalSessions\": 12
  }")
test_endpoint "Create Training Program" "$CREATE_PROGRAM" "title"

PROGRAM_ID=$(echo "$CREATE_PROGRAM" | jq -r '._id' 2>/dev/null)

# 14. Get Programs by Coach
echo "14. GET /api/training-program/coach/:coachId"
GET_PROGRAMS=$(curl -s -X GET "$BASE_URL/api/training-program/coach/$COACH_ID" \
  -H "Authorization: Bearer $COACH_TOKEN")
test_endpoint "Get Programs by Coach" "$GET_PROGRAMS" "title"

# 15. Get Program by ID
echo "15. GET /api/training-program/:programId"
GET_PROGRAM=$(curl -s -X GET "$BASE_URL/api/training-program/$PROGRAM_ID" \
  -H "Authorization: Bearer $COACH_TOKEN")
test_endpoint "Get Program by ID" "$GET_PROGRAM" "title"

# 16. Update Program
echo "16. PUT /api/training-program/:programId"
UPDATE_PROGRAM=$(curl -s -X PUT "$BASE_URL/api/training-program/$PROGRAM_ID" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 6000
  }')
test_endpoint "Update Program" "$UPDATE_PROGRAM" "6000"

echo "=========================================="
echo "PART 5: BOOKING/ENROLLMENT APIs"
echo "=========================================="
echo ""

# 17. Enroll Student
echo "17. POST /api/booking/enroll"
ENROLL=$(curl -s -X POST "$BASE_URL/api/booking/enroll" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"programId\": \"$PROGRAM_ID\",
    \"startDate\": \"2025-12-15\",
    \"slot\": \"morning\",
    \"paymentType\": \"full_advance\"
  }")
test_endpoint "Enroll Student" "$ENROLL" "success"

ENROLLMENT_ID=$(echo "$ENROLL" | jq -r '.data._id' 2>/dev/null)
SESSION_ID=$(echo "$ENROLL" | jq -r '.data.sessions[0]._id' 2>/dev/null)

# 18. Get Student Enrollments
echo "18. GET /api/booking/student/:studentId"
GET_STUDENT_ENROLLMENTS=$(curl -s -X GET "$BASE_URL/api/booking/student/$STUDENT_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_endpoint "Get Student Enrollments" "$GET_STUDENT_ENROLLMENTS" "success"

# 19. Get Coach Enrollments
echo "19. GET /api/booking/coach/:coachId"
GET_COACH_ENROLLMENTS=$(curl -s -X GET "$BASE_URL/api/booking/coach/$COACH_ID" \
  -H "Authorization: Bearer $COACH_TOKEN")
test_endpoint "Get Coach Enrollments" "$GET_COACH_ENROLLMENTS" "success"

# 20. Mark Attendance
echo "20. PATCH /api/booking/:enrollmentId/sessions/:sessionId/attendance"
MARK_ATTENDANCE=$(curl -s -X PATCH "$BASE_URL/api/booking/$ENROLLMENT_ID/sessions/$SESSION_ID/attendance" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attendance": "present"
  }')
test_endpoint "Mark Attendance" "$MARK_ATTENDANCE" "success"

echo "=========================================="
echo "PART 6: CHAT APIs"
echo "=========================================="
echo ""

# 21. Create Chat Room
echo "21. POST /api/chats/create"
CREATE_CHAT=$(curl -s -X POST "$BASE_URL/api/chats/create" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"coachId\": \"$COACH_ID\"
  }")
test_endpoint "Create Chat Room" "$CREATE_CHAT" "members"

CHAT_ROOM_ID=$(echo "$CREATE_CHAT" | jq -r '._id' 2>/dev/null)

# 22. Get User Chat Rooms
echo "22. GET /api/chats/:userId"
GET_CHATS=$(curl -s -X GET "$BASE_URL/api/chats/$STUDENT_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_endpoint "Get User Chat Rooms" "$GET_CHATS" "members"

# 23. Get Messages by Chat Room
echo "23. GET /api/messages/:chatRoomId"
GET_MESSAGES=$(curl -s -X GET "$BASE_URL/api/messages/$CHAT_ROOM_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_endpoint "Get Messages" "$GET_MESSAGES" "[]"

echo "=========================================="
echo "PART 7: REVIEW APIs"
echo "=========================================="
echo ""

# 24. Create Review
echo "24. POST /api/reviews"
CREATE_REVIEW=$(curl -s -X POST "$BASE_URL/api/reviews" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"coachId\": \"$COACH_ID\",
    \"studentId\": \"$STUDENT_ID\",
    \"rating\": 5,
    \"comment\": \"Excellent coach!\"
  }")
test_endpoint "Create Review" "$CREATE_REVIEW" "rating"

# 25. Get Reviews by Coach
echo "25. GET /api/reviews/:coachId"
GET_REVIEWS=$(curl -s -X GET "$BASE_URL/api/reviews/$COACH_ID")
test_endpoint "Get Reviews by Coach" "$GET_REVIEWS" "rating"

echo "=========================================="
echo "PART 8: SEARCH APIs"
echo "=========================================="
echo ""

# 26. Search Coaches
echo "26. GET /api/search/search?sport=Tennis"
SEARCH=$(curl -s -X GET "$BASE_URL/api/search/search?sport=Tennis")
test_endpoint "Search Coaches" "$SEARCH" "[]"

# 27. Get Nearby Coaches
echo "27. GET /api/search/nearby?lat=28.6&lon=77.2&maxDistance=50"
NEARBY=$(curl -s -X GET "$BASE_URL/api/search/nearby?lat=28.6&lon=77.2&maxDistance=50")
test_endpoint "Get Nearby Coaches" "$NEARBY" "[]"

echo "=========================================="
echo "PART 9: SESSION APIs"
echo "=========================================="
echo ""

# 28. Create Session/Class
echo "28. POST /api/session/create"
CREATE_SESSION=$(curl -s -X POST "$BASE_URL/api/session/create" \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"coachId\": \"$COACH_ID\",
    \"sport\": \"Tennis\",
    \"startTime\": \"2025-12-20T10:00:00Z\",
    \"duration\": 60,
    \"price\": 500
  }")
test_endpoint "Create Session" "$CREATE_SESSION" "coachId"

CLASS_ID=$(echo "$CREATE_SESSION" | jq -r '._id' 2>/dev/null)

# 29. Get Classes by Coach
echo "29. GET /api/session/listByCoach/:coachId"
GET_CLASSES=$(curl -s -X GET "$BASE_URL/api/session/listByCoach/$COACH_ID" \
  -H "Authorization: Bearer $COACH_TOKEN")
test_endpoint "Get Classes by Coach" "$GET_CLASSES" "[]"

echo "=========================================="
echo "PART 10: SECURITY TESTS"
echo "=========================================="
echo ""

# 30. Test without token (should fail)
echo "30. Access Protected Route Without Token"
NO_TOKEN=$(curl -s -X GET "$BASE_URL/api/students/$STUDENT_ID")
test_endpoint "No Token (Should Fail)" "$NO_TOKEN" "Unauthorized"

# 31. Test accessing other user's data (should fail)
echo "31. Access Another User's Data"
OTHER_USER=$(curl -s -X GET "$BASE_URL/api/students/$COACH_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
test_endpoint "Access Other User (Should Fail)" "$OTHER_USER" "Forbidden"

# 32. Test weak password (should fail)
echo "32. Register with Weak Password"
WEAK_PASSWORD=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test",
    "email": "weak@example.com",
    "password": "weak",
    "userType": "Student"
  }')
test_endpoint "Weak Password (Should Fail)" "$WEAK_PASSWORD" "Validation failed"

# 33. Test invalid email (should fail)
echo "33. Register with Invalid Email"
INVALID_EMAIL=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test",
    "email": "notanemail",
    "password": "Password123",
    "userType": "Student"
  }')
test_endpoint "Invalid Email (Should Fail)" "$INVALID_EMAIL" "Validation failed"

echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo "Your backend is fully functional and secure! 🎉"
else
    echo -e "${YELLOW}⚠ Some tests failed. Review the output above.${NC}"
fi

echo ""
echo "=========================================="
