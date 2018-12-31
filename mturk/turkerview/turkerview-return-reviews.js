console.log(`we're on the task page`);

function returnReviewsModal(){

}

function returnReviewForm(){

}

async function retrieveReturnReviews(){
    const [dom, props] = await Promise.all([
        ReactDOM(`ShowModal`, `CompletionTimer`),
        ReactProps(`ShowModal`, `CompletionTimer`),
        Enabled(`requesterReviews`)
    ]);

    //console.log(dom);
    //console.log(props);
    //console.log(props.modalOptions.assignableHitsCount);
}

retrieveReturnReviews();