function Fetch(){
document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  // Returns an array of name:value objects
  const formData = new FormData(this);
  // AJAX for fetch
  const response = await fetch('/login', {
                method: 'POST',
                body: formData
               });
 const data = await response.text();
 console.log(formData);});
}

window.addEventListener('load',Fetch);
