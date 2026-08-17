import { signal } from '@preact/signals';
import { useMemo } from "preact/hooks";
import { Card } from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import InputData from "./input-data";
import TableData from "./table-data";
import type { IInputData, Row } from "./model";
import Details from "./details";

const sessionDataKey = 'inputdata'

const loadSessionData = (): IInputData => {
  let newData = {
    amount: 300000,
    years: 20,
    rate: 3.3,
    overpayment: 5.0,
    grundRate: { title: "Baden-Württemberg", rate: 5.0, rank: 1, makler: 3.57 },
    makler: { title: "Nicht Ausgewählt", rate: 0.0, rank: 0, makler: 0.0 },
    landEntry: 0.5,
    notaryFees: 0.95,
    isDetailsOpen: true,
  }

  let data = newData
  try {
    const raw = localStorage.getItem(sessionDataKey);
    if (raw) {
      data = JSON.parse(raw);
    }
  } catch {
    data = newData
  }

  return data;
}

const inputData = signal<IInputData>(loadSessionData());

// Memoize calculation to prevent unnecessary recalculations
const calculateMortgageData = (input: IInputData) => {
  const months = input.years * 12;
  const rate = input.rate / 100.0 / 12;
  const payment = (rate * input.amount) / (1 - Math.pow(1 + rate, -months));
  
  const data: Row[] = [];
  let balance = input.amount;
  let overallPayment = 0.0;

  for (let month = 1; month <= months; month++) {
    const irPaid = balance * rate;
    const amountPaid = payment - irPaid;
    let newBalance = balance - amountPaid;

    if (balance - payment <= 0) {
      break;
    }

    let addPayment = 0.0;

    const year = month % 12;
    if (year === 0) {
      addPayment = balance * input.overpayment / 100.0;
      overallPayment += addPayment;
    }

    const row: Row = {
      cells: [
        { value: Math.floor(month / 12) + 1, width: 60, minWidth: 60 },
        { value: month, width: 80, minWidth: 80 },
        { value: Math.floor(balance), width: 120, minWidth: 120 },
        { value: Number(payment.toFixed(2)), width: 100, minWidth: 100 },
        { value: Number(irPaid.toFixed(2)), width: 100, minWidth: 100 },
        { value: Number(amountPaid.toFixed(2)), width: 100, minWidth: 100 },
        { value: Math.floor(newBalance), width: 120, minWidth: 120 },
        { value: Number(addPayment.toFixed(0)), width: 200, minWidth: 100 },
      ],
    };
    
    data.push(row);
    balance = newBalance - addPayment;
    overallPayment += payment;
  }

  return { data, overallPayment };
};

export default function Layout() {
  const { data, overallPayment } = useMemo(() => calculateMortgageData(inputData.value), [inputData.value]);

  const onChangeInputData = (data: IInputData) => {
    inputData.value = data
    localStorage.setItem(sessionDataKey, JSON.stringify(inputData.value));
  }

  return (
    <div className="max-w-5xl w-full items-center justify-center md:pt-5">
      <Card className="w-full rounded">
        <InputData {...inputData} onChange={onChangeInputData} />
        <Separator />
        <Details {...inputData} overall={overallPayment} onChange={onChangeInputData} />
        <Separator />
        <TableData data={data} isDetailsOpen={inputData.value.isDetailsOpen ?? true} />
      </Card>
    </div>
  )
}