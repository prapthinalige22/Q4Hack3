/**
 * Describe Myfunction here.
 *
 * The exported method is the entry point for your code when the function is invoked. 
 *
 * Following parameters are pre-configured and provided to your function on execution: 
 * @param event: represents the data associated with the occurrence of an event, and  
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
 
 export default async function (event, context, logger) {
    logger.info(
        `Invoking salesforcesdkjs function with payload ${JSON.stringify(event.data || {})}`,
    );

    // Extract properties from payload
    const { loanAmount, borrowerType, borrower, totaldirect, totalindirect} = event.data;

    const totalDirectvar = totaldirect;
    const totalInDirectvar = totalindirect;

    if(borrowerType != 'Guarantor'){
        totalDirectvar = totaldirect+loanAmount;
    }
    else{
        totalInDirectvar = totalindirect+loanAmount;
    }



    // Define a record using the RecordForCreate type and providing the Developer Name
    const account = {
        type: "Account",
        fields:{
            id: borrower,
            TotalDirect: totalDirectvar,
            TotalInDirect:totalInDirectvar
        }
    };


    try {
        // Insert the record using the SalesforceSDK DataApi and get the new Record Id from the result
        const { id: recordId } = await context.org.dataApi.update(account);

        // Query Accounts using the SalesforceSDK DataApi to verify that your new Account was created.
        const soql = `SELECT Fields(STANDARD) FROM Account`;// WHERE Id = '${recordId}'`;
        const queryResults = await context.org.dataApi.query(soql);
        return queryResults;
    } catch (err) {
        // Catch any DML errors and pass the throw an error with the message
        const errorMessage = `Failed to update record. Root Cause: ${err.message}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
}
