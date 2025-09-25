import React from "react";
import StaffContractSection from "../StaffContractSection";
import TransactionSection from "../../../../Orders/components/CustomerOrderDetail/TransactionSection";

interface ContractAndPaymentTabProps {
    contract?: {
        id: string;
        contractName: string;
        effectiveDate: string;
        expirationDate: string;
        totalValue: string;
        supportedValue: string;
        description: string;
        attachFileUrl: string;
        status: string;
        staffName: string;
    };
    transactions?: {
        id: string;
        paymentProvider: string;
        orderCode: string;
        amount: number;
        currencyCode: string;
        status: string;
        paymentDate: string;
    }[];
}

const ContractAndPaymentTab: React.FC<ContractAndPaymentTabProps> = ({
    contract,
    transactions,
}) => {
    return (
        <div>
            {/* Contract Information */}
            {contract && <StaffContractSection contract={contract} />}

            {/* Transaction Information */}
            <TransactionSection transactions={transactions} />
        </div>
    );
};

export default ContractAndPaymentTab; 