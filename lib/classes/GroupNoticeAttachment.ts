import { UUID } from './UUID';

/**
 * Representa um item de inventário para ser enviado como
 * attachment de um group notice.
 *
 * O item DEVE estar no inventário do bot, ser copiável,
 * e o bot precisa ter permissão de envio de notices no grupo.
 */
export class GroupNoticeAttachment
{
    /** UUID do item no inventário do bot */
    public itemID: UUID;

    /** UUID do dono do item (normalmente o agentID do bot) */
    public ownerID: UUID;

    /** Nome do item (exibido na notice para o receptor) */
    public name: string;

    /**
     * AssetType numérico conforme enum do SL:
     *   0  = Texture
     *   3  = Landmark
     *   5  = Object
     *   7  = Notecard
     *   10 = Script
     *   13 = Bodypart
     *   18 = Sound
     *   20 = Animation
     *   24 = Gesture
     */
    public assetType: number;

    public constructor(itemID: UUID, ownerID: UUID, name: string, assetType: number)
    {
        this.itemID    = itemID;
        this.ownerID   = ownerID;
        this.name      = name;
        this.assetType = assetType;
    }

    /**
     * Serializa o attachment no formato binário nativo do SL viewer,
     * esperado pelo campo BinaryBucket do pacote ImprovedInstantMessage.
     *
     * Layout do buffer (referência: SL viewer → llgroupmgr.cpp → sendGroupNotice):
     *
     *   Offset  Size     Field
     *   ------  ----     -----
     *   0       1 byte   has_attachment   (U8, always 1)
     *   1       1 byte   asset_type       (U8)
     *   2       16 bytes item_id          (UUID as raw bytes, no hyphens)
     *   18      16 bytes owner_id         (UUID as raw bytes, no hyphens)
     *   34      N bytes  item_name        (UTF-8 null-terminated string)
     *
     * ATENÇÃO: O simulador do SL rejeita LLSD XML neste campo com o erro
     * "CantParceInventoryInNotice". Apenas o formato binário acima é aceito.
     *
     * NOTA TYPESCRIPT: o retorno é Uint8Array<ArrayBuffer> (não Buffer) para
     * satisfazer o tipo de BinaryBucket da lib. Buffer tem ArrayBufferLike como
     * tipo do .buffer (inclui SharedArrayBuffer), o que quebra a assignabilidade
     * quando o campo espera Uint8Array<ArrayBuffer> estritamente.
     */
    public serialize(): Uint8Array
    {
        // Buffer.from() é usado apenas para conversões de string/hex (não atribuído ao campo).
        // O bucket principal é new Uint8Array() puro, garantindo ArrayBuffer concreto.
        const nameBytes  = Buffer.from(this.name + '\x00', 'utf-8');
        const itemBytes  = Buffer.from(this.itemID.toString().replace(/-/g, ''),  'hex'); // 16 bytes
        const ownerBytes = Buffer.from(this.ownerID.toString().replace(/-/g, ''), 'hex'); // 16 bytes

        const bucket = new Uint8Array(2 + 16 + 16 + nameBytes.length);
        let off = 0;

        bucket[off++] = 1;               // has_attachment = 1
        bucket[off++] = this.assetType;  // asset_type

        // .set() aceita qualquer ArrayLike<number>, incluindo Buffer (subclasse de Uint8Array)
        bucket.set(itemBytes,  off); off += 16; // item_id  (16 bytes, raw UUID)
        bucket.set(ownerBytes, off); off += 16; // owner_id (16 bytes, raw UUID)
        bucket.set(nameBytes,  off);             // item_name (null-terminated)

        return bucket;
    }
}