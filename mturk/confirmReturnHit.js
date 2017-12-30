(async () => {
    await ready({ enabled: `confirmReturnHIT` });

    document.addEventListener(`submit`, (event) => {
        const returning = event.target.querySelector(`[value="delete"]`);

        if (returning) {
            event.preventDefault();

            if (confirm(`Are you sure you want to return this HIT?`)) {
                event.target.submit();
            }
        }
    });
})();