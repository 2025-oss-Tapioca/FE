import React from 'react';
import "../../styles/css/teamCard.css";
import { Users, EllipsisVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

export default function TeamCard({ name, description, memberCount }) {
  const navigate = useNavigate();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-s h-[280px] hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-4xl mb-2">{name}</CardTitle>
            <CardDescription className="flex gap-2">
              { description || "팀 설명이 없습니다." }
            </CardDescription>
            <CardAction className="mt-1">
              <EllipsisVertical size={20} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex mt-auto justify-end gap-1">
            <Users size={20} />
            {memberCount}명
          </CardFooter>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>‘{name}’ 팀으로 이동할까요?</DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={() => navigate("/")}>팀 이동</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
