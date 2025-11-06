# Part 3 tasks you with the following:
  - Implementing any feedback received mentioned on your part 2 rubric
  - Dockerize the entire application, so that it can be started using a single docker-compose.yml file (backend + both portals)

# Common mistakes noticed were:
  1. Default hashing and salting settings for bcrypt
  2. Not implementing all protections mentioned in part 1 document
  3. Only implementing SSL on the backend or frontend. It is needed on both
  4. Incomplete devops pipeline (make use of CircleCi for pipeline management and some form of security scan like SonarQube/SonarCloud)
  5. Inconsistent UI

# New things required are:
## A new, employee only portal.
- This portal will NOT have a registration page. You should create 1, super admin account, that has the ability to create new employee accounts that can access the system.
- A login page for the employees, and the administrator (employees should only be able to manage payments, and admins should only be able to manage employees)
- The same password securities you had in part 2, should be present now for part 3 accounts
- REGEX whitelisting/blacklisting is required on this portal as well
- An SSL certificate is required for this portal as well
- Any other frontend protections present on the part 2 portal, are required to be on the part 3 portal
## Employee Flow:
1. Login (POST)
2. View a list of payments that are currently "pending" (these are payments submitted using your part 2 portal) (GET)
3. Approve or deny any of the payments that are waiting (PUT request)
4. Be able to view a "history" of previously approved/denied payments (GET)
5. Log off (GET)

## Admin Flow:
1. Login (POST)
2. Be able to see a list of employee accounts that are available to use (they should not be able to see the passwords) (GET)
3. Create new employee accounts that can be used to access the part 3 portal (POST)
4. Be able to delete any employee account (DELETE)
5. Log off (GET)
