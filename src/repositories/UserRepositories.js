const users = ["Leo", "Abc", "123", "abcab"];

export function getUsers() {
   return users
}

export function addUser(user) {
   users.push(user);
}