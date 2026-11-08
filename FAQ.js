// FAQ Accordion Functionality

const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach(function(question) {

    question.addEventListener("click", function() {

        const currentItem = question.parentElement;

        // Close other questions
        document.querySelectorAll(".faq-item").forEach(function(item) {

            if (item !== currentItem) {
                item.classList.remove("active");
            }

        });

        // Toggle current question
        currentItem.classList.toggle("active");

    });

});