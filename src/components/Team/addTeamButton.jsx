import React, { useState } from "react";
import { Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";



export default function AddTeamButton({ onCreate, isCreating }) {

    const [teamName, setTeamName] = useState("");
    const [teamDesc, setTeamDesc] = useState("");

    const handleSubmit = () => {
        if (!teamName.trim()) return;
        onCreate({
            name: teamName,
            description: teamDesc
        });
        setTeamName("");
        setTeamDesc("");
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default">
                    <Plus size={16} />
                    팀 생성
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>팀 생성</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="team-name">팀 이름</Label>
                        <Input
                            id="team-name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="예: 타피오카"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="team-desc">설명 (선택)</Label>
                        <Textarea
                            id="team-desc"
                            value={teamDesc}
                            onChange={(e) => setTeamDesc(e.target.value)}
                            placeholder="팀에 대한 간단한 소개"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">취소</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            onClick={handleSubmit}
                            disabled={!teamName.trim() || isCreating}
                        >
                            {isCreating ? '생성 중...' : '생성'}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
