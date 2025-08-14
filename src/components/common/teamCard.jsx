import React, { useState } from 'react';
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

export default function TeamCard({ teamCode, name, description, memberCount, onDelete, isDeleting }) {
  const navigate = useNavigate();
  // 2. 삭제 확인 다이얼로그의 상태를 제어할 useState를 추가합니다.
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const team_code = teamCode || "default-code"; // teamCode가 없을 경우 기본값 설정


  const handleDelete = () => {
    onDelete({ teamCode: team_code });
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      {/* --- 1. 팀 이동 다이얼로그 (기존 코드) --- */}
      <Dialog>
        <DialogTrigger asChild>
          <Card className="w-s h-[280px] hover:shadow-md transition-shadow cursor-pointer relative">
            <CardHeader>
              <CardTitle className="text-4xl mb-2">{name}</CardTitle>
              <CardDescription>{description || "팀 설명이 없습니다."}</CardDescription>

              <div className="absolute top-4 right-4">
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild onClick={(e) => {
                    e.stopPropagation(); // 부모 DialogTrigger 이벤트 전파 방지
                    setIsDropdownOpen(true); // 수동으로 열기
                  }}>
                    <Button variant="ghost" size="icon">
                      <EllipsisVertical size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                    {/* 3. '팀 삭제' 메뉴 아이템을 선택하면, 삭제 다이얼로그의 상태를 true로 변경합니다. */}
                    <DropdownMenuItem
                      onSelect={() => {
                        // 3. 삭제 메뉴 선택 시, 드롭다운은 닫고 삭제 다이얼로그는 엽니다.
                        setIsDropdownOpen(false);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-red-500"
                    >
                      팀 탈퇴
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardFooter className="flex mt-auto justify-end gap-1">
              <Users size={20} />
              {memberCount}명
            </CardFooter>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>‘{name}’ 팀으로 이동할까요?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">취소</Button></DialogClose>
            <Button onClick={() => navigate(`/team/${teamCode}`)}>팀 이동</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말로 ‘{name}’ 팀을 탈퇴하시겠습니까?</DialogTitle>
            <p className="text-sm text-muted-foreground pt-2">이 작업은 되돌릴 수 없습니다.</p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
            <Button variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}>
              {isDeleting ? '탈퇴 중...' : '탈퇴'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
