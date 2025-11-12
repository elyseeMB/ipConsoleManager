import logo from "./assets/images/logo-universal.png";
import { ListIp } from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models.js";
import { useState } from "preact/hooks";
import { h } from "preact";
import { useAsyncEffect } from "./hooks/useAsyncEffect";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table.jsx";

const columns = ["IP", "MAC", "TYPE", "VENDOR", "HOSTNAME"] as const;

type ColumnName = (typeof columns)[number];

function defineColumns(cols: typeof columns) {
  return (
    <>
      {cols.map((c) => (
        <TableHead
          className={
            columns[0] ? "w-[100px]" : "" && columns.length ? "text-right" : ""
          }
        >
          {c}
        </TableHead>
      ))}
    </>
  );
}

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

export function App(props: any) {
  const [devices, setDevices] = useState<main.Devices[]>([]);

  useAsyncEffect(async () => {
    const response = await ListIp();
    setDevices(response);
  }, []);

  console.log(devices);

  return (
    <>
      <Table>
        <TableCaption>A list Devices.</TableCaption>
        <TableHeader>
          <TableRow>{defineColumns(columns)}</TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.IP}>
              <TableCell className="font-medium">{device.IP}</TableCell>
              <TableCell>{device.MAC}</TableCell>
              <TableCell>{device.TYPE}</TableCell>
              <TableCell>{device.VENDOR.company}</TableCell>
              <TableCell>{device.HOSTNAME}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length - 1}>Total</TableCell>
            <TableCell className="text-right"> {devices.length} </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}
