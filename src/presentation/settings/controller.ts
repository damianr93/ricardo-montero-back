import { Request, Response } from "express";
import { CustomError, UpdateSettingDto } from "../../domain";
import { SettingService } from "../services/setting.service";

export class SettingController {

    //*DI
    constructor(
        private readonly settingService: SettingService,
    ) { };

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        };

        return res.status(500).json({ error: 'Internal Server Error' });
    };

    getSettings = async (req: Request, res: Response) => {
        this.settingService.getSettings()
            .then(settings => res.json(settings))
            .catch(error => this.handleError(error, res));
    };

    updateSettings = async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user.role || user.role[0] !== 'ADMIN_ROLE') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to update settings.' });
        }

        const [error, updateSettingDto] = UpdateSettingDto.update(req.body);
        if (error) return res.status(400).json({ error });

        this.settingService.updateSettings(updateSettingDto!)
            .then(settings => res.json(settings))
            .catch(error => this.handleError(error, res));
    };
}
