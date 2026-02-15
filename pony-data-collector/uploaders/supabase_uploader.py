"""Supabase uploader for celebrity Makeup DNA records.

Handles upserting individual and batch Makeup DNA records to the
celeb_makeup_dna table in Supabase, with conflict resolution on celeb_id.
"""

import logging

from supabase import Client, create_client

logger = logging.getLogger(__name__)

TABLE_NAME = "celeb_makeup_dna"


class SupabaseUploader:
    """Uploads Makeup DNA records to Supabase.

    Supports single and batch upserts to the celeb_makeup_dna table,
    with conflict resolution on the celeb_id column.
    """

    def __init__(self, url: str, key: str) -> None:
        """Initialize the Supabase client.

        Args:
            url: Supabase project URL.
            key: Supabase service role key.
        """
        self._client: Client = create_client(url, key)
        logger.info("Supabase client initialized for %s", url)

    def upload_celeb_dna(self, dna: dict) -> dict:
        """Upsert a single celebrity Makeup DNA record.

        Uses celeb_id as the conflict resolution key. If a record
        with the same celeb_id exists, it will be updated.

        Args:
            dna: Makeup DNA dict. Must include a 'celeb_id' key.

        Returns:
            The upserted record from Supabase.

        Raises:
            ValueError: If dna is missing the 'celeb_id' key.
            RuntimeError: If the Supabase upsert fails.
        """
        if "celeb_id" not in dna:
            raise ValueError("DNA record must include 'celeb_id'")

        celeb_id = dna["celeb_id"]
        logger.info("Uploading DNA for celeb: %s", celeb_id)

        try:
            response = (
                self._client.table(TABLE_NAME)
                .upsert(dna, on_conflict="celeb_id")
                .execute()
            )
        except Exception as exc:
            raise RuntimeError(
                f"Supabase upsert failed for {celeb_id}: {exc}"
            ) from exc

        logger.info("Successfully uploaded DNA for %s", celeb_id)
        return response.data[0] if response.data else dna

    def upload_batch(self, dna_list: list[dict]) -> list[dict]:
        """Upload multiple celebrity Makeup DNA records.

        Upserts each record individually to provide per-record error
        handling and logging.

        Args:
            dna_list: List of Makeup DNA dicts.

        Returns:
            List of successfully upserted records.
        """
        logger.info("Uploading batch of %d DNA records", len(dna_list))

        results: list[dict] = []

        for dna in dna_list:
            celeb_id = dna.get("celeb_id", "unknown")
            try:
                result = self.upload_celeb_dna(dna)
                results.append(result)
            except (ValueError, RuntimeError) as exc:
                logger.error("Failed to upload DNA for %s: %s", celeb_id, exc)
                continue

        logger.info(
            "Batch upload complete: %d/%d records uploaded",
            len(results), len(dna_list),
        )
        return results

    def get_all_celebs(self) -> list[dict]:
        """Fetch all celebrity Makeup DNA records from Supabase.

        Returns:
            List of all celeb_makeup_dna records.

        Raises:
            RuntimeError: If the Supabase query fails.
        """
        logger.info("Fetching all celeb DNA records")

        try:
            response = (
                self._client.table(TABLE_NAME)
                .select("*")
                .execute()
            )
        except Exception as exc:
            raise RuntimeError(
                f"Failed to fetch celeb DNA records: {exc}"
            ) from exc

        records = response.data or []
        logger.info("Fetched %d celeb DNA records", len(records))
        return records
