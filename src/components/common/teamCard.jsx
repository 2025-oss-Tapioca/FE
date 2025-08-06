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

export default function TeamCard() {
  const teamName = "타피오카";
  const navigate = useNavigate();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-s h-[280px] hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-4xl mb-2">{teamName}</CardTitle>
            <CardDescription className="flex gap-2">
              웹 개발 협업 및 프로젝트 관리 플랫폼
            </CardDescription>
            <CardAction className="mt-1">
              <EllipsisVertical size={20} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex mt-auto justify-end gap-1">
            <Users size={20} />
            8명
          </CardFooter>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>‘{teamName}’ 팀으로 이동할까요?</DialogTitle>
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
