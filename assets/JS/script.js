/* ==========================================
   DOM ELEMENTS
========================================== */

const expenseForm = document.getElementById("expenseForm");
const editId = document.getElementById("editId");
const title = document.getElementById("title");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const transactionDate = document.getElementById("transactionDate");
const submitBtn = document.getElementById("submitBtn");
const searchInput = document.getElementById("searchInput");
const transactionList = document.getElementById("transactionList");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const currentBalance = document.getElementById("currentBalance");
const monthlyIncome = document.getElementById("monthlyIncome");
const monthlyExpense = document.getElementById("monthlyExpense");
const monthlyBalance = document.getElementById("monthlyBalance");
const toast = document.getElementById("toast");
const loader = document.getElementById("loader");

/* ==========================================
   APP STATE
========================================== */

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

/* ==========================================
   LOADER
========================================== */

window.addEventListener("load", () => {

    if(loader){

        setTimeout(()=>{

            loader.style.display="none";

        },500);

    }

});

/* ==========================================
   UTILITIES
========================================== */

function generateId(){

    return Date.now().toString();

}

function showToast(message){

    toast.innerText = message;

    toast.style.display = "block";

    setTimeout(()=>{

        toast.style.display="none";

    },2500);

}

function resetForm(){

    expenseForm.reset();

    editId.value="";

    submitBtn.innerHTML=`
        <i class="fa-solid fa-plus"></i>
        Add Transaction
    `;

}

/* ==========================================
   RENDER
========================================== */

function renderTransactions() {

    transactionList.innerHTML = "";
    const keyword = searchInput.value.trim().toLowerCase();
    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;

    const filteredTransactions = transactions.filter(transaction => {

        const matchesSearch =

            transaction.title.toLowerCase().includes(keyword) ||
            transaction.category.toLowerCase().includes(keyword);

        const matchesType =

            selectedType === "all" ||
            transaction.type === selectedType;

        const matchesCategory =

            selectedCategory === "all" ||
            transaction.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;

});
   if (filteredTransactions.length === 0){

        transactionList.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-wallet"></i>
            <h3>No Transactions Yet</h3>
            <p>Add your first income or expense.</p>
        </div>
        `;

        return;
    }

    filteredTransactions.forEach(transaction => {

        transactionList.innerHTML += `

        <div class="transaction ${transaction.type}">

            <div class="transaction-left">

                <div class="transaction-icon">
                    <i class="fa-solid ${transaction.type === "income"
                        ? "fa-arrow-trend-up"
                        : "fa-arrow-trend-down"}"></i>
                </div>

                <div>

                    <div class="transaction-title">
                        ${transaction.title}
                    </div>

                    <div class="transaction-category">
                        ${transaction.category} • ${transaction.date}
                    </div>

                </div>

            </div>

            <div class="transaction-right">

                <div class="transaction-amount">
                    ${transaction.type === "income" ? "+" : "-"} ₹${transaction.amount}
                </div>

                <div style="display:flex; gap:10px;">

                    <button
                        class="action-btn edit-btn"
                        data-id="${transaction.id}"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="action-btn delete-btn"
                        data-id="${transaction.id}"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </div>

        </div>

        `;

    });

    attachDeleteEvents();

}

/* ==========================================
   SUMMARY
========================================== */

function updateSummary(){

    let income=0;
    let expense=0;

    transactions.forEach(item=>{

        if(item.type==="income"){

            income+=Number(item.amount);

        }else{

            expense+=Number(item.amount);

        }

    });

    totalIncome.innerText=`₹${income}`;

    totalExpense.innerText=`₹${expense}`;

    currentBalance.innerText=`₹${income-expense}`;

}
function updateMonthlyReport(){

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction=>{

        const date = new Date(transaction.date);

        if(
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ){

            if(transaction.type==="income"){

                income += Number(transaction.amount);

            }else{

                expense += Number(transaction.amount);

            }

        }

    });

    monthlyIncome.innerText = `₹${income}`;
    monthlyExpense.innerText = `₹${expense}`;
    monthlyBalance.innerText = `₹${income-expense}`;

}
function saveToLocalStorage(){

    localStorage.setItem(

        "transactions",

        JSON.stringify(transactions)

    );

}
function deleteTransaction(id){

    transactions = transactions.filter(transaction => transaction.id !== id);

    saveToLocalStorage();

    renderTransactions();

    updateSummary();
    updateMonthlyReport();
    showToast("Transaction Deleted");

}
function editTransaction(id){

    const transaction = transactions.find(item => item.id === id);

    if(!transaction) return;

    editId.value = transaction.id;

    title.value = transaction.title;

    amount.value = transaction.amount;

    type.value = transaction.type;

    category.value = transaction.category;

    transactionDate.value = transaction.date;

    submitBtn.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Update Transaction
    `;

    title.focus();

}
function attachDeleteEvents(){

    document.querySelectorAll(".delete-btn").forEach(button=>{

        button.addEventListener("click",()=>{

            const id = button.dataset.id;

            if(confirm("Delete this transaction?")){

                deleteTransaction(id);

            }

        });

    });

    document.querySelectorAll(".edit-btn").forEach(button=>{

        button.addEventListener("click",()=>{

            editTransaction(button.dataset.id);

        });

    });

}
/* ==========================================
   ADD TRANSACTION
========================================== */

expenseForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    const transaction={

        id: editId.value || generateId(),

        title:title.value.trim(),

        amount:Number(amount.value),

        type:type.value,

        category:category.value,

        date:transactionDate.value

    };

    if(editId.value){

        transactions = transactions.map(item =>

            item.id === editId.value ? transaction : item

        );

        showToast("Transaction Updated");

    }else{

        transactions.push(transaction);

        showToast("Transaction Added Successfully");

    }

    saveToLocalStorage();

    renderTransactions();

    updateSummary();
    updateMonthlyReport();
    resetForm();

});

/* ==========================================
   DEFAULT DATE
========================================== */

transactionDate.valueAsDate = new Date();
renderTransactions();
updateSummary();
updateMonthlyReport();
searchInput.addEventListener("input", () => {

    renderTransactions();

});
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
} else {
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light");

    const light = document.body.classList.contains("light");

    localStorage.setItem(
        "theme",
        light ? "light" : "dark"
    );

    themeToggle.innerHTML = light
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';

});
console.log("Expense Tracker Ready");
filterType.addEventListener("change", () => {

    renderTransactions();

});

filterCategory.addEventListener("change", () => {

    renderTransactions();

});
/* ==========================================
   KEYBOARD SHORTCUTS
========================================== */

document.addEventListener("keydown", (e) => {

    // Ctrl + N → Focus Title Input
    if (e.ctrlKey && e.key.toLowerCase() === "n") {

        e.preventDefault();

        title.focus();

    }

    // ESC → Reset Form
    if (e.key === "Escape") {

        resetForm();

    }

    // Ctrl + F → Search
    if (e.ctrlKey && e.key.toLowerCase() === "f") {

        e.preventDefault();

        searchInput.focus();

    }

});
function scrollToSection(id){

    const section = document.getElementById(id);

    if(section){

        section.scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

    }

}