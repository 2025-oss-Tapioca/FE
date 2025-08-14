import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 1. 부모로부터 함수와 로딩 상태를 props로 받습니다.
export default function JoinTeamDialog({ onJoin, isJoining }) {
    // 2. 다이얼로그의 열림/닫힘 상태를 직접 제어하기 위해 useState를 사용합니다.
    const [open, setOpen] = useState(false);
    const [teamCode, setTeamCode] = useState("");

    const handleJoin = () => {
        if (!teamCode.trim()) return;
        onJoin({ teamCode: teamCode });
        setTeamCode("");
    };

    return (
        // 4. open과 onOpenChange prop으로 다이얼로그 상태를 제어합니다.
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <UserPlus size={16} />
                    팀 참가
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>팀 참가</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="team-code">팀 코드</Label>
                        <Input
                            id="team-code"
                            value={teamCode}
                            onChange={(e) => setTeamCode(e.target.value)}
                            placeholder="예: 4F7K92"
                            disabled={isJoining}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">취소</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            onClick={handleJoin}
                            disabled={!teamCode.trim() || isJoining}
                        >
                            {isJoining ? '생성 중...' : '생성'}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}