import express, { Request, Response } from "express";
import dayjs, { Dayjs } from "dayjs";
import cors from "cors";

type User = {
  id: string;
  name: string;
};

const users: User[] = [
  { id: "1", name: "Jon Doe" },
  { id: "2", name: "Tim" },
  { id: "3", name: "Tom" },
];

type Order = {
  users: string[];
  orderDate: string | Dayjs;
};

type Table = {
  id: string;
  orders: Order[];
};

const table: Table = {
  id: "1",
  orders: [] as Order[],
};

const app = express();

app.use(cors());

app.get("/available-date", (req: Request, res: Response) => {
  const lastOrder = table.orders[table.orders.length - 1];
  const lastOrderDate = lastOrder && dayjs(lastOrder.orderDate);

  if (lastOrderDate == null) {
    return res.status(200).json({
      message: `the available dates start from :  ${dayjs().format()}`,
      availableDate: dayjs().format(),
    });
  }

  if (lastOrder.users.length === 2) {
    const nextDate = lastOrderDate.add(3, "hour").format();
    return res.status(200).json({
      message: `The table is full, the available dates start from nowwwww ${nextDate}`,
      availableDate: nextDate,
    });
  }

  if (lastOrder.users.length === 1) {
    return res.status(200).json({
      message: `there is one sit left on this table, you can order from ${lastOrderDate.format()}`,
      availableDate: lastOrderDate.format("YYYY-MM-DD HH:mm"),
    });
  }
});

app.post("/order/:userId/:date", (req, res) => {
  const date = req.params.date == null ? dayjs() : dayjs(req.params.date);
  const userId = req.params.userId;
  const lastOrder = table.orders[table.orders.length - 1];

  if (!getUserById(userId)) {
    return res.status(404).json({ error: "User not found" });
  }

  if (lastOrder && lastOrder.users.length === 1) {
    if (lastOrder.users.includes(userId)) {
      return res.status(400).json({ error: "You can't sit on both seats" });
    }

    lastOrder.users.push(userId);
    return res.status(200).json(table);
  }

  if (lastOrder && lastOrder.users.length === 2) {
    const diff = date.diff(lastOrder.orderDate, "hour");
    const nextDate = dayjs(lastOrder.orderDate).add(3, "hour").format();
    if (diff < 3) {
      return res.status(400).json({
        error: `You cannot order for now, the next available date start from : ${nextDate}`,
      });
    }
  }

  const order = {
    users: [userId],
    orderDate: date.format(),
  };
  table.orders.push(order);
  return res.status(200).json(table);
});

function getUserById(id: string) {
  const user = users.find((user) => user.id === id);
  return user;
}

const PORT = 5001;
app.listen(PORT, () => console.log(`server is running on ${PORT}`));
