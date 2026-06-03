#!/bin/bash
BASE="http://localhost:8081/api/v1/auth"
ADMIN_USER="hospital_admin"
NEW_USER="reception_jane2"

echo "==========================================="
echo "RECEPTIONIST RBAC FLOW - END-TO-END TEST"
echo "==========================================="

echo ""
echo "[Step 1] Hospital Admin login..."
ADMIN_TOKEN=$(curl -s -X POST $BASE/login -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"password\"}" | jq -r '.accessToken')
echo "  ✓ Logged in as $ADMIN_USER (token len: ${#ADMIN_TOKEN})"

echo ""
echo "[Step 2] Fetching available functionalities..."
FUNCS=$(curl -s $BASE/admin/functionalities -H "Authorization: Bearer $ADMIN_TOKEN")
PV=$(echo $FUNCS | jq '.[] | select(.code=="patients.view") | .id')
PC=$(echo $FUNCS | jq '.[] | select(.code=="patients.create") | .id')
AV=$(echo $FUNCS | jq '.[] | select(.code=="appointments.view") | .id')
AC=$(echo $FUNCS | jq '.[] | select(.code=="appointments.create") | .id')
DV=$(echo $FUNCS | jq '.[] | select(.code=="dashboard.view") | .id')
echo "  ✓ patients.view=$PV patients.create=$PC appointments.view=$AV appointments.create=$AC dashboard.view=$DV"

echo ""
echo "[Step 3] Creating GROUP 'Junior Receptionist'..."
TS=$(date +%s)
GROUP=$(curl -s -X POST $BASE/admin/groups -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Junior Receptionist $TS\",\"description\":\"Patient registration + appointment booking\",\"functionalityIds\":[$DV,$PV,$PC,$AV,$AC]}")
GROUP_ID=$(echo $GROUP | jq '.id')
echo "  ✓ Group id=$GROUP_ID, functionalities:"
echo $GROUP | jq '.functionalities[] | "    - " + .code + " (" + .label + ")"' -r

echo ""
echo "[Step 4] Creating ROLE 'Receptionist'..."
ROLE=$(curl -s -X POST $BASE/admin/roles -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"FRONT_DESK_$TS\",\"name\":\"Receptionist $TS\",\"description\":\"Front desk staff\",\"groupIds\":[$GROUP_ID]}")
ROLE_ID=$(echo $ROLE | jq '.id')
echo "  ✓ Role id=$ROLE_ID, name=$(echo $ROLE | jq -r '.name')"
echo "  Groups: $(echo $ROLE | jq -r '.groups[].name')"

echo ""
echo "[Step 5] Creating USER 'reception_jane_$TS'..."
USER_NAME="reception_jane_$TS"
USER=$(curl -s -X POST $BASE/admin/users -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"email\":\"jane$TS@hospital.local\",\"password\":\"password\",\"permRoleId\":$ROLE_ID}")
USER_ID=$(echo $USER | jq '.id')
echo "  ✓ User id=$USER_ID, username=$(echo $USER | jq -r '.username')"

echo ""
echo "[Step 6] Logging in as $USER_NAME..."
JANE=$(curl -s -X POST $BASE/login -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"password\":\"password\"}")
echo "  ✓ System roles: $(echo $JANE | jq -c '.roles')"
echo "  ✓ Effective funcs: $(echo $JANE | jq -c '.funcs')"

echo ""
echo "[Step 7] Assertions..."
ACTUAL=$(echo $JANE | jq -r '.funcs[]')
PASS=true
for e in dashboard.view patients.view patients.create appointments.view appointments.create; do
  if echo "$ACTUAL" | grep -qx "$e"; then echo "  ✓ has $e"; else echo "  ✗ MISSING $e"; PASS=false; fi
done
for f in lab.view pharmacy.view billing.view reports.view admin.users; do
  if echo "$ACTUAL" | grep -qx "$f"; then echo "  ✗ SHOULD NOT HAVE $f"; PASS=false; else echo "  ✓ correctly denied $f"; fi
done

echo ""
$PASS && echo "🎉 ALL CHECKS PASSED" || echo "❌ SOME CHECKS FAILED"

echo ""
echo "Test user credentials saved for documentation:"
echo "  Username: $USER_NAME"
echo "  Password: password"
