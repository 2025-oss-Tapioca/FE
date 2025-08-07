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

export default function JoinTeamDialog({ onJoin }) {
    const [teamCode, setTeamCode] = useState("");

    const handleJoin = () => {
        if (!teamCode.trim()) return;

        // 임시 데이터: 실제 사용 시 API 요청을 통해 팀 정보를 조회해야 함
        const mockTeamData = {
            id: Date.now(),
            name: `코드 ${teamCode}`, // 서버 응답값으로 대체 가능
            description: "팀 코드로 참가한 팀입니다.",
            memberCount: Math.floor(Math.random() * 10 + 1),
        };

        onJoin(mockTeamData);
        setTeamCode("");
    };

    return (
        <Dialog>
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
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">취소</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={handleJoin}>참가</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
